{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };
  outputs = { self, nixpkgs }: {
    nixosModules.radio-api = import ./api/module.nix;
    nixosModules.default = self.nixosModules.radio-api;
  };
}
