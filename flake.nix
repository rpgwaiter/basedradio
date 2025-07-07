{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
  };
  outputs = { self, nixpkgs }: {
    nixosModules.radio-api = import ./api/module.nix;
    nixosModules.default = self.nixosModules.radio-api;
  };
}
