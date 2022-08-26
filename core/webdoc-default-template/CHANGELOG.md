# Change Log - @webdoc/default-template

This log was last generated on Fri, 26 Aug 2022 09:26:31 GMT and should not be manually modified.

## 2.1.0
Fri, 26 Aug 2022 09:26:31 GMT

### Updates

- Faster page reloads and an offline storage option developed on top of a service worker!

## 2.0.0
Sat, 16 Jul 2022 23:37:07 GMT

_Version update only_

## 1.6.6
Tue, 14 Jun 2022 01:01:45 GMT

_Version update only_

## 1.6.5
Sun, 12 Jun 2022 20:53:46 GMT

### Updates

- Add support for the @group tag for grouping different documents in the explorer. For example, if A and B have "@group Alphabet" they will appear under an "Alphabet" item in the explorer on the left side.
- Move "Powered by webdoc!" out of the footer and into a watermark element. Add mermaid diagrams support.

## 1.6.3
Fri, 10 Jun 2022 00:19:18 GMT

### Updates

- Fix image "src" attributes not being prefixed by site root.

## 1.6.2
Thu, 09 Jun 2022 03:55:26 GMT

### Updates

- Add support for copying static assets into the website using template.assets in the configuration file. A preprocessor is used to detect file usage in img "src" attributes and replace them with the final link.

## 1.6.1
Tue, 07 Jun 2022 02:12:51 GMT

### Updates

- Add a "properties" table for showing the subproperties of class members. Fixed pages for functions being generated without parameter or return data.

## 1.6.0
Mon, 06 Jun 2022 00:15:27 GMT

_Version update only_

## 1.5.7
Sun, 20 Feb 2022 18:11:30 GMT

_Version update only_

## 1.5.6
Sat, 12 Feb 2022 19:48:05 GMT

### Updates

- MUCH better styling for DocSearch.

## 1.5.5
Tue, 28 Sep 2021 01:43:51 GMT

_Version update only_

## 1.5.4
Sun, 19 Sep 2021 16:37:03 GMT

_Version update only_

## 1.5.3
Sun, 12 Sep 2021 19:13:46 GMT

_Version update only_

## 1.5.2
Sun, 12 Sep 2021 19:13:02 GMT

_Version update only_

## 1.5.1
Sat, 10 Jul 2021 01:54:14 GMT

_Version update only_

## 1.5.0
Sun, 06 Jun 2021 19:52:29 GMT

### Updates

- Publish source files and link properties/methods to them with config.template.sources = true! New analytics integration with support for Google Analytics and Plausible as well.

## 1.4.0
Sun, 23 May 2021 21:16:03 GMT

### Updates

- Add "plain" variant". Expose alias for "header", "footer", "explorer", and "bottom-banner". The first 3 are for the plain variant (only).

## 1.3.4
Mon, 03 May 2021 14:30:44 GMT

### Updates

- Fix React errors in web app, and a few styling improvements; fix the app bar gaps not collapsing when the screen doesn't have enough space.

## 1.3.3
Sun, 02 May 2021 22:03:03 GMT

### Updates

- Fill links in the exported manifest's registry.

## 1.3.2
Sat, 01 May 2021 23:21:56 GMT

### Updates

- Use CSS Grid to fix scrolling issues in Safari. Don't generate README file if not provided. Don't output API reference if document tree is empty (i.e. you're using webdoc to generate a tutorials-only site) Add support for custom app bar items.

## 1.3.1
Sun, 25 Apr 2021 21:01:31 GMT

### Updates

- Fix issues with --site-root was defined with tutorials and the explorer

## 1.3.0
Sun, 25 Apr 2021 20:31:03 GMT

### Updates

- Add experimental support for adding stylesheets. Separate explorer from its header, and move header to always be in the app bar (even when explorer is closed).
- Add support for tutorials

## 1.2.2
Sat, 24 Apr 2021 13:49:32 GMT

_Version update only_

## 1.2.1
Sat, 17 Apr 2021 23:54:20 GMT

_Version update only_

## 1.2.0
Sun, 07 Feb 2021 20:20:23 GMT

### Updates

- Add global search (Algolia integration) and touchups for customization. Add support for configuring meta tags.

## 1.1.6
Tue, 02 Feb 2021 04:00:07 GMT

### Updates

- Redesign of the template (in-progress). Added explorer filter and collapsing functionality.

## 1.1.5
Sun, 17 Jan 2021 16:21:24 GMT

_Version update only_

## 1.1.4
Sat, 16 Jan 2021 16:17:04 GMT

_Version update only_

## 1.1.3
Sat, 28 Nov 2020 16:51:35 GMT

_Version update only_

## 1.1.2
Sun, 22 Nov 2020 16:57:25 GMT

_Version update only_

## 1.1.1
Fri, 06 Nov 2020 00:46:42 GMT

### Updates

- 1.1.0 flop because @webdoc/default-template didn't publish all files.

## 1.0.1
Fri, 06 Nov 2020 00:32:36 GMT

### Updates

- Release webdoc 1.1.0 with better linking API that supports method overloads and DPL queries

