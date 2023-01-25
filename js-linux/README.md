# js-linux-modified
A modified version of Fabrice Bellard's JSLinux; needed to run a couple ae27ff tools.

NOTE: contents are copyright of Fabrice Bellard and subject to the attached [LICENSE](https://github.com/ae27ff/js-linux-modified/blob/main/LICENSE) which must be kept intact.

## Modifications applied by this fork
 - JSLinux loader modified to allow setting startup parameters by another script instead of only from page address/query (more modular)
 - Upload progress code can be disabled by a global flag until more modular code can be added.
 - File table has been modified to indicate mounted files at reserved addresses
 - File system requests are caught by a PHP loader which redirects reserved addresses to mounted files.

## Prerequisites
 - Server with PHP support
 - Server must be configured to rewrite paths like `/index/abc` to execute `/index.php` (we need this for `/vm_files/buildroot-x86/files/address` to execute `/vm_files/buildroot-x86/files.php`)
