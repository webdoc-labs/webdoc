# Change Log - @webdoc/language-parser

This log was last generated on Sat, 27 Aug 2022 10:38:56 GMT and should not be manually modified.

## 2.1.2
Sat, 27 Aug 2022 10:38:56 GMT

_Version update only_

## 2.1.1
Sat, 27 Aug 2022 09:27:43 GMT

_Version update only_

## 2.1.0
Fri, 26 Aug 2022 09:26:31 GMT

_Version update only_

## 2.0.0
Sat, 16 Jul 2022 23:37:07 GMT

_Version update only_

## 1.6.6
Tue, 14 Jun 2022 01:01:45 GMT

_Version update only_

## 1.6.5
Sun, 12 Jun 2022 20:53:46 GMT

_Version update only_

## 1.6.3
Fri, 10 Jun 2022 00:19:18 GMT

_Version update only_

## 1.6.2
Thu, 09 Jun 2022 03:55:26 GMT

_Version update only_

## 1.6.1
Tue, 07 Jun 2022 02:12:51 GMT

### Updates

- Fix issues with documenting object properties with string literal keys. Fix parsing of standalone @function documentation comments.

## 1.6.0
Mon, 06 Jun 2022 00:15:27 GMT

_Version update only_

## 1.5.7
Sun, 20 Feb 2022 18:11:30 GMT

### Updates

- Fix parameter type annotation parsing when parameter is assigned a default value (https://github.com/webdoc-labs/webdoc/issues/144)
- Add primitive type inference for untyped parameters with a default value (https://github.com/webdoc-labs/webdoc/issues/138)
- Fix inheritance of overloaded methods. Prior to this fix, only the first overload was automatically inherited.
- Fix issues with spread tuples in vararg parameters

## 1.5.6
Sat, 12 Feb 2022 19:48:05 GMT

_Version update only_

## 1.5.5
Tue, 28 Sep 2021 01:43:51 GMT

### Updates

- Added support for parsing type parameters. Fixes related to type inference and @ignore included.

## 1.5.4
Sun, 19 Sep 2021 16:37:03 GMT

### Updates

- Fix inference issues with getter-setter properties

## 1.5.3
Sun, 12 Sep 2021 19:13:46 GMT

_Version update only_

## 1.5.2
Sun, 12 Sep 2021 19:13:02 GMT

### Updates

- Fix issue with data-types of symbols not being inferred, and them being unlinked in the final documentation

## 1.5.1
Sat, 10 Jul 2021 01:54:14 GMT

_Version update only_

## 1.5.0
Sun, 06 Jun 2021 19:52:30 GMT

### Updates

- Indexer (symbol-tree generator) is now parallelized. To disable multithreading, pass --no-workers to the CLI.

## 1.4.0
Sun, 23 May 2021 21:16:03 GMT

_Version update only_

## 1.3.4
Mon, 03 May 2021 14:30:44 GMT

_Version update only_

## 1.3.3
Sun, 02 May 2021 22:03:03 GMT

_Version update only_

## 1.3.2
Sat, 01 May 2021 23:21:56 GMT

_Version update only_

## 1.3.1
Sun, 25 Apr 2021 21:01:31 GMT

_Version update only_

## 1.3.0
Sun, 25 Apr 2021 20:31:03 GMT

### Updates

- Add support for ES5-declared classes and the @classdesc tag.

## 1.2.2
Sat, 24 Apr 2021 13:49:32 GMT

_Version update only_

## 1.2.1
Sat, 17 Apr 2021 23:54:20 GMT

### Updates

- Fix interface property inference (#100), fix method access inference (#101), potential fix of LinkerPlugin.linkTo crashing with @pixi/webdoc-template (#103)

## 1.2.0
Sun, 07 Feb 2021 20:20:23 GMT

### Updates

- Fix package documents being unsorted.

## 1.1.6
Tue, 02 Feb 2021 04:00:07 GMT

### Updates

- Fix crash when decorators are present in a source file.

## 1.1.5
Sun, 17 Jan 2021 16:21:24 GMT

### Updates

- Fix incorrect inference of class, interface extends, implements in some cases and when the referred symbols are qualified names

## 1.1.4
Sat, 16 Jan 2021 16:17:04 GMT

### Updates

- Added support for readonly tags, fix default value emitting on documents, add type inference for primitive type properties

## 1.1.3
Sat, 28 Nov 2020 16:51:35 GMT

_Version update only_

## 1.1.2
Sun, 22 Nov 2020 16:57:25 GMT

_Version update only_

## 1.1.1
Fri, 06 Nov 2020 00:46:42 GMT

_Version update only_

## 1.0.1
Fri, 06 Nov 2020 00:32:36 GMT

### Updates

- Release webdoc 1.1.0 with better linking API that supports method overloads and DPL queries

