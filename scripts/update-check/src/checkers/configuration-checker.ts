import fs from 'fs';
import path from 'path';
import { Logger } from '../logger';

export interface ConfigurationCheckResult {
  hasIssues: boolean;
  issues: Array<{
    file: string;
    type: 'missing' | 'invalid' | 'outdated';
    message: string;
    severity: 'error' | 'warning';
  }>;
}

export interface ConfigurationStatus {
  status: 'ok' | 'issues' | 'error';
  issueCount: number;
}

export class ConfigurationChecker {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async check(): Promise<ConfigurationCheckResult> {
    this.logger.info('Checking configuration files...');
    
    const result: ConfigurationCheckResult = {
      hasIssues: false,
      issues: []
    };

    try {
      // Check package.json
      const packageJsonIssues = this.checkPackageJson();
      result.issues.push(...packageJsonIssues);

      // Check .cursor/rules
      const cursorRulesIssues = this.checkCursorRules();
      result.issues.push(...cursorRulesIssues);

      // Check TypeScript configuration
      const tsConfigIssues = this.checkTypeScriptConfig();
      result.issues.push(...tsConfigIssues);

      // Check ESLint configuration
      const eslintIssues = this.checkEslintConfig();
      result.issues.push(...eslintIssues);

      // Check for missing environment files
      const envIssues = this.checkEnvironmentFiles();
      result.issues.push(...envIssues);

      // Determine if there are issues
      result.hasIssues = result.issues.some(issue => issue.severity === 'error');

      this.logger.info('Configuration check completed', { 
        issues: result.issues.length,
        errors: result.issues.filter(i => i.severity === 'error').length,
        warnings: result.issues.filter(i => i.severity === 'warning').length
      });

    } catch (error) {
      this.logger.error('Configuration check failed', error);
      result.hasIssues = true;
      result.issues.push({
        file: 'configuration-checker',
        type: 'invalid',
        message: `Check failed: ${error}`,
        severity: 'error'
      });
    }

    return result;
  }

  async getStatus(): Promise<ConfigurationStatus> {
    try {
      const result = await this.check();
      return {
        status: result.hasIssues ? 'issues' : 'ok',
        issueCount: result.issues.length
      };
    } catch {
      return {
        status: 'error',
        issueCount: 0
      };
    }
  }

  private checkPackageJson(): Array<{
    file: string;
    type: 'missing' | 'invalid' | 'outdated';
    message: string;
    severity: 'error' | 'warning';
  }> {
    const issues: Array<{
      file: string;
      type: 'missing' | 'invalid' | 'outdated';
      message: string;
      severity: 'error' | 'warning';
    }> = [];

    const packageJsonPath = path.join(process.cwd(), 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      issues.push({
        file: 'package.json',
        type: 'missing',
        message: 'package.json file is missing',
        severity: 'error'
      });
      return issues;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      // Check required fields
      if (!packageJson.name) {
        issues.push({
          file: 'package.json',
          type: 'invalid',
          message: 'Missing "name" field',
          severity: 'error'
        });
      }

      if (!packageJson.version) {
        issues.push({
          file: 'package.json',
          type: 'invalid',
          message: 'Missing "version" field',
          severity: 'warning'
        });
      }

      // Check scripts
      if (!packageJson.scripts) {
        issues.push({
          file: 'package.json',
          type: 'invalid',
          message: 'Missing "scripts" section',
          severity: 'warning'
        });
      } else {
        const requiredScripts = ['build', 'test', 'lint'];
        for (const script of requiredScripts) {
          if (!packageJson.scripts[script]) {
            issues.push({
              file: 'package.json',
              type: 'invalid',
              message: `Missing "${script}" script`,
              severity: 'warning'
            });
          }
        }
      }

    } catch (error) {
      issues.push({
        file: 'package.json',
        type: 'invalid',
        message: `Invalid JSON: ${error}`,
        severity: 'error'
      });
    }

    return issues;
  }

  private checkCursorRules(): Array<{
    file: string;
    type: 'missing' | 'invalid' | 'outdated';
    message: string;
    severity: 'error' | 'warning';
  }> {
    const issues: Array<{
      file: string;
      type: 'missing' | 'invalid' | 'outdated';
      message: string;
      severity: 'error' | 'warning';
    }> = [];

    const cursorDir = path.join(process.cwd(), '.cursor');
    
    if (!fs.existsSync(cursorDir)) {
      issues.push({
        file: '.cursor/',
        type: 'missing',
        message: '.cursor directory is missing',
        severity: 'warning'
      });
      return issues;
    }

    const rulesDir = path.join(cursorDir, 'rules');
    if (!fs.existsSync(rulesDir)) {
      issues.push({
        file: '.cursor/rules/',
        type: 'missing',
        message: '.cursor/rules directory is missing',
        severity: 'warning'
      });
    } else {
      // Check for core rule files
      const requiredRules = ['00-core.mdc', '01-workflow.mdc', '02-quality.mdc'];
      for (const rule of requiredRules) {
        const rulePath = path.join(rulesDir, rule);
        if (!fs.existsSync(rulePath)) {
          issues.push({
            file: `.cursor/rules/${rule}`,
            type: 'missing',
            message: `Missing core rule file: ${rule}`,
            severity: 'warning'
          });
        }
      }
    }

    return issues;
  }

  private checkTypeScriptConfig(): Array<{
    file: string;
    type: 'missing' | 'invalid' | 'outdated';
    message: string;
    severity: 'error' | 'warning';
  }> {
    const issues: Array<{
      file: string;
      type: 'missing' | 'invalid' | 'outdated';
      message: string;
      severity: 'error' | 'warning';
    }> = [];

    const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
    
    if (!fs.existsSync(tsConfigPath)) {
      issues.push({
        file: 'tsconfig.json',
        type: 'missing',
        message: 'tsconfig.json file is missing',
        severity: 'warning'
      });
      return issues;
    }

    try {
      const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));

      // Check for required compiler options
      if (!tsConfig.compilerOptions) {
        issues.push({
          file: 'tsconfig.json',
          type: 'invalid',
          message: 'Missing "compilerOptions"',
          severity: 'error'
        });
      } else {
        const requiredOptions = ['target', 'module', 'strict'];
        for (const option of requiredOptions) {
          if (tsConfig.compilerOptions[option] === undefined) {
            issues.push({
              file: 'tsconfig.json',
              type: 'invalid',
              message: `Missing compiler option: ${option}`,
              severity: 'warning'
            });
          }
        }
      }

    } catch (error) {
      issues.push({
        file: 'tsconfig.json',
        type: 'invalid',
        message: `Invalid JSON: ${error}`,
        severity: 'error'
      });
    }

    return issues;
  }

  private checkEslintConfig(): Array<{
    file: string;
    type: 'missing' | 'invalid' | 'outdated';
    message: string;
    severity: 'error' | 'warning';
  }> {
    const issues: Array<{
      file: string;
      type: 'missing' | 'invalid' | 'outdated';
      message: string;
      severity: 'error' | 'warning';
    }> = [];

    const eslintConfigs = [
      'eslint.config.js',
      'eslint.config.cjs',
      '.eslintrc.js',
      '.eslintrc.json',
      '.eslintrc.yml'
    ];

    const hasEslintConfig = eslintConfigs.some(config => 
      fs.existsSync(path.join(process.cwd(), config))
    );

    if (!hasEslintConfig) {
      issues.push({
        file: 'eslint.config.*',
        type: 'missing',
        message: 'ESLint configuration file is missing',
        severity: 'warning'
      });
    }

    return issues;
  }

  private checkEnvironmentFiles(): Array<{
    file: string;
    type: 'missing' | 'invalid' | 'outdated';
    message: string;
    severity: 'error' | 'warning';
  }> {
    const issues: Array<{
      file: string;
      type: 'missing' | 'invalid' | 'outdated';
      message: string;
      severity: 'error' | 'warning';
    }> = [];

    const envExamplePath = path.join(process.cwd(), '.env.example');
    if (!fs.existsSync(envExamplePath)) {
      issues.push({
        file: '.env.example',
        type: 'missing',
        message: '.env.example file is missing',
        severity: 'warning'
      });
    }

    return issues;
  }
}
