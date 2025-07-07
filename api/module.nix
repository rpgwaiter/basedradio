{
  pkgs,
  lib,
  config,
  ...
}:
with lib; let
  cfg = config.services.radio-api;
in {
  options.services.radio-api = {
    enable = mkEnableOption "Enable BasedRadio webhook service";

    package = mkOption {
      type = types.package;
      default = pkgs.callPackage ./. {};
      defaultText = "pkgs.radio-api";
      description = "Set version of radio-api package to use.";
    };

    musicDir = mkOption {
      type = types.str;
      default = "/Music";
      description = "Local path to the radio files";
    };

    api = {
      hostName = mkOption {
        type = types.str;
        default = "localhost";
        description = "Hostname of the radio api";
      };
      port = mkOption {
        type = types.port;
        default = 9969;
        description = "Port of the radio api";
      };
    };

    mpd = {
      hostName = mkOption {
        type = types.str;
        default = "localhost";
        description = "Hostname of the mpd instance";
      };
      port = mkOption {
        type = types.port;
        default = 6600;
        description = "Port of the mpd instance";
      };
    };
  };

  config = mkIf cfg.enable {
    # environment.systemPackages = [cfg.package]; # if user should have the command available as well
    # services.dbus.packages = [cfg.package]; # if the package has dbus related configuration

    systemd.services.radio-api = {
      description = "BasedRadio Api server daemon.";

      wantedBy = ["multi-user.target"];
      after = ["network.target"];

      restartIfChanged = true;

      environment = {
        MPD_HOST = cfg.mpd.hostName;
        MPD_PORT = toString cfg.mpd.port;
        RADIO_MUSIC_DIR = cfg.musicDir;
        RADIO_API_HOST = cfg.api.hostName;
        RADIO_API_PORT = toString cfg.api.port;
        PYTHONUNBUFFERED = "1";
      };

      serviceConfig = {
        AmbientCapabilities = "CAP_NET_BIND_SERVICE";
        DynamicUser = true;
        ExecStart = "${cfg.package}/bin/radio-webhook";
        Restart = "always";
      };
    };
  };

  meta.maintainers = with lib.maintainers; [];
}
