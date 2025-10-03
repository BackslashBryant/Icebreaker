import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { Logger } from '../logger';

export interface SpecKitCheckResult {
  hasIssues: boolean;
  installed: boolean;
  version?: string;
  commands: string[];
  issues: string[];
}

export interface SpecKitStatus {
  status: 'ok' | 'missing' | 'outdated' | 'error';
  version: string;
}

export class SpecKitChecker {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async check(): Promise<SpecKitCheckResult> {
    this.logger.info('Checking Spec Kit installation...');
    
    const result: SpecKitCheckResult = {
      hasIssues: false,
      installed: false,
      commands: [],
      issues: []
    };

    try {
      // Check if Spec Kit is installed
      const specKitPath = path.join(process.cwd(), '.specify');
      result.installed = fs.existsSync(specKitPath);

      if (!result.installed) {
        result.hasIssues = true;
        result.issues.push('Spec Kit not installed - .specify directory missing');
        this.logger.warn('Spec Kit not found');
        return result;
      }

      // Check Spec Kit version
      const version = await this.getSpecKitVersion();
      result.version = version;

      // Check available commands
      const commands = await this.getAvailableCommands();
      result.commands = commands;

      // Validate Spec Kit structure
      const structureIssues = this.validateSpecKitStructure();
      result.issues.push(...structureIssues);

      if (structureIssues.length > 0) {
        result.hasIssues = true;
      }

      this.logger.info('Spec Kit check completed', { 
        installed: result.installed,
        version: result.version,
        commands: result.commands.length,
        issues: result.issues.length
      });

    } catch (err) {
      this.logger.error('Spec Kit check failed', err);
      result.hasIssues = true;
      result.issues.push(`Check failed: ${err}`);
    }

    return result;
  }

  async getStatus(): Promise<SpecKitStatus> {
    try {
      const result = await this.check();
      
      if (!result.installed) {
        return { status: 'missing', version: 'unknown' };
      }
      
      if (result.hasIssues) {
        return { status: 'error', version: result.version || 'unknown' };
      }
      
      return { status: 'ok', version: result.version || 'unknown' };
    } catch {
      return { status: 'error', version: 'unknown' };
    }
  }

  private async getSpecKitVersion(): Promise<string> {
    try {
      // Try to get version from package.json if available
      const packageJsonPath = path.join(process.cwd(), '.specify', 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        return packageJson.version || 'unknown';
      }

      // Try to get version from git if it's a git repository
      try {
        const version = execSync('git describe --tags --always', { 
          encoding: 'utf8',
          cwd: path.join(process.cwd(), '.specify')
        }).trim();
        return version;
      } catch {
        // Fallback to checking if it's the official Spec Kit
        const readmePath = path.join(process.cwd(), '.specify', 'README.md');
        if (fs.existsSync(readmePath)) {
          const readme = fs.readFileSync(readmePath, 'utf8');
          if (readme.includes('Spec Kit')) {
            return 'installed';
          }
        }
      }

      return 'unknown';
    } catch (error) {
      this.logger.debug('Failed to get Spec Kit version', error);
      return 'unknown';
    }
  }

  private async getAvailableCommands(): Promise<string[]> {
    const commands: string[] = [];
    
    try {
      // Check for command templates
      const commandsDir = path.join(process.cwd(), '.specify', 'templates', 'commands');
      if (fs.existsSync(commandsDir)) {
        const commandFiles = fs.readdirSync(commandsDir);
        for (const file of commandFiles) {
          if (file.endsWith('.md')) {
            commands.push(file.replace('.md', ''));
          }
        }
      }

      // Check for scripts
      const scriptsDir = path.join(process.cwd(), '.specify', 'scripts');
      if (fs.existsSync(scriptsDir)) {
        const scriptFiles = fs.readdirSync(scriptsDir, { recursive: true });
        for (const file of scriptFiles) {
          if (typeof file === 'string' && file.endsWith('.sh')) {
            const commandName = path.basename(file, '.sh');
            if (!commands.includes(commandName)) {
              commands.push(commandName);
            }
          }
        }
      }

    } catch (error) {
      this.logger.debug('Failed to get available commands', error);
    }

    return commands;
  }

  private validateSpecKitStructure(): string[] {
    const issues: string[] = [];
    const requiredPaths = [
      '.specify/memory',
      '.specify/specs',
      '.specify/templates',
      '.specify/scripts'
    ];

    for (const requiredPath of requiredPaths) {
      const fullPath = path.join(process.cwd(), requiredPath);
      if (!fs.existsSync(fullPath)) {
        issues.push(`Missing required directory: ${requiredPath}`);
      }
    }

    // Check for constitution
    const constitutionPath = path.join(process.cwd(), '.specify', 'memory', 'constitution.md');
    if (!fs.existsSync(constitutionPath)) {
      issues.push('Missing constitution.md file');
    }

    // Check for templates
    const templateFiles = [
      '.specify/templates/spec-template.md',
      '.specify/templates/plan-template.md',
      '.specify/templates/tasks-template.md'
    ];

    for (const templateFile of templateFiles) {
      const fullPath = path.join(process.cwd(), templateFile);
      if (!fs.existsSync(fullPath)) {
        issues.push(`Missing template file: ${templateFile}`);
      }
    }

    return issues;
  }
}
