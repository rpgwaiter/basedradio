{pkgs, ...}:
with pkgs.python312Packages;
  buildPythonApplication rec {
    pname = "radio-api";
    version = "0.0.1";
    pyproject = true;

    src = ./.;

    propagatedBuildInputs = [
      setuptools
      requests
      pkgs.python312Packages.mpd2
      pkgs.python312Packages.flask
    ];
  }
