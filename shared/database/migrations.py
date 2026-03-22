"""
Aerich Migration Manager for Tortoise-ORM
Автоматизация миграций
"""
import subprocess
from pathlib import Path


def run_aerich_command(command):
    """Run aerich command"""
    try:
        result = subprocess.run(
            ['aerich'] + command,
            cwd=Path(__file__).parent.parent.parent,
            check=True,
            capture_output=True,
            text=True
        )
        print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error: {e.stderr}")
        return False


def init_aerich():
    """Initialize aerich (run once)"""
    return run_aerich_command(['init', '-t', 'shared.database.models.TORTOISE_ORM'])


def create_migration(message):
    """Create new migration"""
    return run_aerich_command(['migrate', '-n', message])


def upgrade_database():
    """Upgrade database to latest version"""
    return run_aerich_command(['upgrade'])


def downgrade_database():
    """Downgrade database"""
    return run_aerich_command(['downgrade'])


def show_history():
    """Show migration history"""
    return run_aerich_command(['history'])


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Database Migration Manager (Aerich)')
    parser.add_argument('command', choices=[
        'init', 'migrate', 'upgrade', 'downgrade', 'history'
    ], help='Migration command')
    parser.add_argument('-m', '--message', help='Migration message')
    
    args = parser.parse_args()
    
    if args.command == 'init':
        init_aerich()
    elif args.command == 'migrate':
        if not args.message:
            print("Error: Migration message required (-m 'message')")
            exit(1)
        create_migration(args.message)
    elif args.command == 'upgrade':
        upgrade_database()
    elif args.command == 'downgrade':
        downgrade_database()
    elif args.command == 'history':
        show_history()
