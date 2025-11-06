Gem::Specification.new do |spec|
  spec.name          = "jekyll"
  spec.version       = "999.0.0"
  spec.authors       = ["Tillerstead Build"]
  spec.summary       = "Lightweight offline builder for the Tillerstead site"
  spec.description   = "Ships a minimal Jekyll-compatible CLI that renders the Tillerstead site without external gems."
  spec.license       = "MIT"

  spec.files = Dir.chdir(__dir__) do
    Dir["lib/**/*", "bin/*", "README*"].sort
  end
  spec.bindir        = "bin"
  spec.executables   = ["jekyll"]
  spec.require_paths = ["lib"]
end
