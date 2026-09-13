# Uninstall Guide

This guide covers how to remove Outlook for Linux from your system, including the application itself and your user data.

:::tip
The uninstall steps depend on which package you installed from [GitHub Releases](https://github.com/Taylor8484/outlook-for-linux/releases). If you're unsure, check your package manager's list of installed packages for `outlook-for-linux`.
:::

## Removing the Application

### Debian/Ubuntu (.deb)

```bash
# Remove the application, its configuration, and any orphaned dependencies
sudo apt purge --autoremove outlook-for-linux

# Or, with dpkg directly
sudo dpkg -P outlook-for-linux
```

### Red Hat/Fedora (.rpm)

```bash
# Fedora / RHEL (dnf)
sudo dnf remove outlook-for-linux

# Or, with rpm directly
sudo rpm -e outlook-for-linux
```

### AppImage

AppImage files are standalone executables with no system-level installation. Delete the AppImage file you downloaded:

```bash
rm outlook-for-linux-*.AppImage
```

If you used [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) or Gear Lever, also remove the desktop integration it created.

### Portable Installation (tar.gz)

Delete the extracted directory:

```bash
rm -rf outlook-for-linux-*/
```

### Built from source

Delete your clone of the repository. Nothing is installed system-wide by `npm start`.

## Removing User Data

Uninstalling the application does not remove your user data and configuration. To perform a complete removal, delete the configuration directory for your installation type:

| Installation type | Configuration directory |
|-------------------|----------------------|
| deb, rpm, AppImage, tar.gz | `~/.config/outlook-for-linux` |
| From source (`npm start`) | `~/.config/Electron/` |
| Separate instances | Each `--user-data-dir` you created (see [Multiple Instances](multiple-instances.md)) |

A system-wide configuration file, if your administrator created one, lives at `/etc/outlook-for-linux/config.json`.

:::warning
Removing user data deletes your cached login sessions, configuration, and any local application data. This action cannot be undone.
:::

## Related Documentation

- [Installation Guide](installation.md): install Outlook for Linux
- [Configuration](configuration.md): configuration reference
- [Troubleshooting](troubleshooting.md): common issues and solutions
