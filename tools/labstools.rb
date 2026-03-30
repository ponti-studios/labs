class Labstools < Formula
  desc "Labs team CLI tools (token counter, etc.)"
  homepage "https://github.com/ponti-labs/labs-tools"
  url "https://github.com/ponti-labs/labs-tools/archive/refs/tags/v0.1.0.tar.gz"
  sha256 "placeholder"
  license "MIT"
  head "https://github.com/ponti-labs/labs-tools.git", branch: "main"

  depends_on "python@3.13"
  depends_on "setuptools"

  def install
    system "python3.13", "-m", "pip", "install", "-e", ".", "--prefix=#{prefix}"
    bin.install_symlink "tiktoken-count" => "tiktoken-count"
  end

  def caveats
    <<~EOS
      tiktoken-count is installed as a Python package.
      Run it with: tiktoken-count <folder>
    EOS
  end

  test do
    (testpath/"example.md").write("# Hello\n\nToken counting test.")
    system bin/"tiktoken-count", testpath
  end
end
