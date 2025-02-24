const path = require("path");
const { FusesPlugin } = require("@electron-forge/plugin-fuses");
const { FuseV1Options, FuseVersion } = require("@electron/fuses");

module.exports = {
  packagerConfig: {
    name: "GPODofus3",
    asar: false,
    icon: path.join(
      __dirname,
      "staticfiles",
      "medias",
      "icons",
      "favicons",
      "icon.ico"
    ),
    executableName: "GPOD3",
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "GPODofus3",
        authors: "AnthoB-Dev",
        description: "Guide de progression optimisée pour Dofus 3",
        setupIcon: path.join(
          __dirname,
          "staticfiles",
          "medias",
          "icons",
          "favicons",
          "icon.ico"
        ),
        noMsi: true,
        iconUrl: path.join(
          __dirname,
          "staticfiles",
          "medias",
          "icons",
          "favicons",
          "icon.ico"
        ),
        oneClick: false
      },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
  ],
  "publishers": [
    {
      "name": "@electron-forge/publisher-github",
      "config": {
        "repository": {
          "owner": "AnthoB-Dev",
          "name": "GPODofus3-dev"
        },
        "prerelease": false,
        "draft": false
      }
    }
  ],
  plugins: [
    // Fuses sont utilisés pour activer/désactiver diverses fonctionnalités d'Electron
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: true,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: false,
      [FuseV1Options.OnlyLoadAppFromAsar]: false,
    }),
  ],
};
