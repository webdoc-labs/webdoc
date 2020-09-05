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
	$Debouce = 1
)

$global:LastEventTS = Get-Date
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

		Write-Host "Update($TimeStamp): $Path was $ChangeType"
		Write-Host "EXECUTING: $global:CMD $global:CMDArgs"
		Start-Process $global:CMD $global:CMDArgs -Wait

		$global:LastEventTS = Get-Date
	} catch {}
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

Write-Host "Watchdog is online on $WatchPath/$Filter"
Write-Host "Press CTRL-C to exit."

[console]::TreatControlCAsInput = $true

while ($true) {
	if ($Host.UI.RawUI.KeyAvailable -and (3 -eq [int]$Host.UI.RawUI.ReadKey("AllowCtrlC,IncludeKeyUp,NoEcho").Character)) {
		Write-Host "Shutting down watchdog."
		[Environment]::Exit(0)
	}
}
