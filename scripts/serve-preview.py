"""Loopback-only static preview with GitHub Pages-style 404 fallback."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class PreviewHandler(SimpleHTTPRequestHandler):
    def list_directory(self, path):
        self.send_error(404)
        return None

    def send_error(self, code, message=None, explain=None):
        fallback = Path(self.directory) / '404.html'
        if code == 404 and fallback.is_file():
            data = fallback.read_bytes()
            self.send_response(404)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(data)))
            self.send_header('X-Robots-Tag', 'noindex, nofollow')
            self.end_headers()
            if self.command != 'HEAD':
                self.wfile.write(data)
            return
        super().send_error(code, message, explain)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--directory', default='build')
    parser.add_argument('--port', type=int, default=4178)
    args = parser.parse_args()
    directory = Path(args.directory).resolve(strict=True)
    if not (directory / 'index.html').is_file():
        parser.error('Choose a built static site directory containing index.html')
    handler = partial(PreviewHandler, directory=str(directory))
    with ThreadingHTTPServer(('127.0.0.1', args.port), handler) as server:
        print(f'Preview: http://127.0.0.1:{args.port}/', flush=True)
        server.serve_forever()
