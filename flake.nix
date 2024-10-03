{
  description = "ISO 24229 Registry Website";
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/master";
    flake-utils.url = "github:numtide/flake-utils";
    devshell.url = "github:numtide/devshell/main";
    flake-compat = {
      url = "github:edolstra/flake-compat";
      flake = false;
    };
  };
  outputs =
    { self, nixpkgs, flake-utils, devshell, flake-compat, ... }:
    flake-utils.lib.eachDefaultSystem (system:
    let
      cwd = builtins.toString ./.;
      overlays = map (x: x.overlays.default) [
        devshell
      ];
      pkgs = import nixpkgs { inherit system overlays; };
    in
    rec {

      # nix develop
      devShell = pkgs.devshell.mkShell {
        env = [
        ];
        commands = [
          {
            name = "astro";
            command = "make astro \"$@\"";
            help = "Run Astro";
            category = "NPM";
          }
          {
            name = "build";
            command = "make build \"$@\"";
            help = "Build the site";
            category = "NPM";
          }
          {
            name = "dev";
            command = "make dev \"$@\"";
            help = "Start the development server";
            category = "NPM";
          }
          {
            name = "preview";
            command = "make preview \"$@\"";
            help = "Preview the site in production mode";
            category = "NPM";
          }
          {
            name = "check";
            command = "make check \"$@\"";
            help = "Check the site for errors";
            category = "NPM";
          }
          {
            name = "update-flakes";
            command = "make update-flakes \"$@\"";
            help = "Update all flakes";
            category = "Nix";
          }
        ];
        packages = with pkgs; [
          biome
          # nodejs_22
        ];
      };
    });
}
