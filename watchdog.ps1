#!/usr/bin/env pwsh

# Run provided command on file chnages detected

param (
	[Parameter(Mandatory = $False)]
	[string]
	$WatchPath = ".",
	[Parameter(Mandatory = $False)]
	[string]
	$Filter =  "*.*",
	[Parameter(Mandatory = $True)]
	[string]
	$CMD,
	[Parameter(Mandatory = $False)]
	[string]
	$CMDArgs,
	[Parameter(Mandatory = $False)]
	[float]
	$Debounce = 0.5
)

Function WD-Echo {
	param (
		[Parameter(Mandatory = $True)]
		[string]
		$text,
		[Parameter(Mandatory = $False)]
		[string]
		$ID
	)
	[string] $header = "[WATCHDOG]:"
	if ($ID -ne "") {
		$header += $ID + ":"
	}
	Write-Host "$header $text"
	# return $True
}

$global:LastEventTS = Get-Date
[bigint] $global:TaskNo = 0
Function FS-Event-Callback {
	param (
		$FSEvent
	)
	try {
		$Path = $FSEvent.SourceEventArgs.FullPath
		# $FileName = $FSEvent.SourceEventArgs.Name
		$ChangeType = $FSEvent.SourceEventArgs.ChangeType
		$TimeStamp = Get-Date -Date $FSEvent.TimeGenerated

		$TSDiff = (New-TimeSpan -Start $global:LastEventTS -End $TimeStamp).TotalSeconds
		if ($TSDiff -lt $global:Debouce) {
			return
		}
		$global:TaskNo += 1
		WD-Echo "Update($TimeStamp): $Path was $ChangeType" $global:TaskNo
		WD-Echo "Executing task ($global:TaskNo): $global:CMD $global:CMDArgs" $global:TaskNo
		Start-Process $global:CMD $global:CMDArgs -Wait -NoNewWindow
		WD-Echo "Task done." $global:TaskNo
		$global:LastEventTS = Get-Date
	} catch {
		WD-Echo "Error during command execution." $global:TaskNo
	}
}

Function Register-Watcher {
	param (
		[Parameter(Mandatory = $True)]
		[string]
		$Path,
		[Parameter(Mandatory = $True)]
		[string]
		$Mask
	)
	$watcher = New-Object IO.FileSystemWatcher -ArgumentList ($Path, $Mask) -Property @{ 
		IncludeSubdirectories = $True
		EnableRaisingEvents = $True
	}

	Register-ObjectEvent -InputObject $watcher -EventName "Changed" -Action {
		FS-Event-Callback $Event
	}
	Register-ObjectEvent -InputObject $watcher -EventName "Created" -Action {
		FS-Event-Callback $Event
	}
	Register-ObjectEvent -InputObject $watcher -EventName "Deleted" -Action {
		FS-Event-Callback $Event
	}

	return $watcher
}

Register-Watcher $WatchPath $Filter | Out-Null

WD-Echo "Watchdog is online on $WatchPath/$Filter"

Function Shutdown-Watchdog {
	WD-Echo "Shutting down watchdog."
	[Environment]::Exit(0)
}

if ($Host.UI.RawUI.KeyAvailable) {
	[console]::TreatControlCAsInput = $true
	WD-Echo "Press CTRL-C or Q to exit."
	while ($true) {
		
		if ($Host.UI.RawUI.KeyAvailable) {
			$KeyInfo = $Host.UI.RawUI.ReadKey("AllowCtrlC,IncludeKeyUp,NoEcho")
			$char = [int]$KeyInfo.Character
			switch ($char) {
				{$_ -in (3, 113)} {
					Shutdown-Watchdog
					break
				}
				default {
					# No-op
				}
			}
		}
	}
}

WD-Echo "No key input handling available."
WD-Echo "You must manually kill the process in order to stop the watchdog."
