"""Enable the separately served WIP page without changing the portfolio app."""
from pathlib import Path
import shutil
import subprocess

config = Path('/etc/nginx/sites-available/sabrinababakulova.uz')
backup = config.with_name(config.name + '.before-wip-20261026')
assert backup.exists(), 'Back up the nginx site first'
source = config.read_text()
start = source.index('    location / {')
end = source.index('\n    }', start) + 6
assert 'proxy_pass http://127.0.0.1:3000;' in source[start:end]
replacement = '''    # Reversible maintenance gate; original app stays on 127.0.0.1:3000.
    # Restore sabrinababakulova.uz.before-wip-20261026 to reopen.
    root /var/www/sabrina-wip;
    index index.html;

    location ^~ /_wip/ {
        try_files $uri =404;
    }

    # Old routes and assets never reach the portfolio while this gate is enabled.
    location / {
        rewrite ^ /index.html break;
    }

    add_header Cache-Control "no-store" always;'''
shutil.copy2(Path(__file__).parent / 'fonts.css', '/var/www/sabrina-wip/_wip/fonts.css')
config.write_text(source[:start] + replacement + source[end:])
try:
    subprocess.run(['nginx', '-t'], check=True)
except subprocess.CalledProcessError:
    config.write_text(source)
    raise
subprocess.run(['systemctl', 'reload', 'nginx'], check=True)
print('Maintenance gate enabled; original application and nginx backup preserved.')
