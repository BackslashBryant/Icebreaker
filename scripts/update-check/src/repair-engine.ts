import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { Logger } from './logger';
import { CheckResults, RepairOptions } from './update-checker';

export interface RepairResult {
  performed: number;
  failed: number;
  details: string[];
}

export class RepairEngine {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async repair(results: CheckResults, options: RepairOptions): Promise<RepairResult> {
    const repairResult: RepairResult = {
      performed: 0,
      failed: 0,
      details: []
    };

    this.logger.info('Starting repair process', { options });

    try {
      // Repair dependencies
      if (results.dependencies?.hasIssues) {
        const depsResult = await this.repairDependencies(results.dependencies, options);
        repairResult.performed += depsResult.performed;
        repairResult.failed += depsResult.failed;
        repairResult.details.push(...depsResult.details);
      }

      // Repair Spec Kit
      if (results.specKit?.hasIssues) {
        const specKitResult = await this.repairSpecKit(results.specKit, options);
        repairResult.performed += specKitResult.performed;
        repairResult.failed += specKitResult.failed;
        repairResult.details.push(...specKitResult.details);
      }

      // Repair configuration
      if (results.configuration?.hasIssues) {
        const configResult = await this.repairConfiguration(results.configuration, options);
        repairResult.performed += configResult.performed;
        repairResult.failed += configResult.failed;
        repairResult.details.push(...configResult.details);
      }

      this.logger.info('Repair process completed', repairResult);

    } catch (error) {
      this.logger.error('Repair process failed', error);
      repairResult.failed++;
      repairResult.details.push(`Repair process failed: ${error}`);
    }

    return repairResult;
  }

  private async repairDependencies(depsResult: any, options: RepairOptions): Promise<RepairResult> {
    const result: RepairResult = { performed: 0, failed: 0, details: [] };

    if (options.dryRun) {
      result.details.push('Would update outdated dependencies');
      return result;
    }

    try {
      // Create backup if requested
      if (options.backup) {
        await this.createBackup('package.json');
      }

      // Update outdated packages
      if (depsResult.outdated && depsResult.outdated.length > 0) {
        for (const pkg of depsResult.outdated) {
          try {
            const updateCommand = `npm update ${pkg.name}`;
            execSync(updateCommand, { stdio: 'pipe' });
            result.performed++;
            result.details.push(`Updated ${pkg.name} from ${pkg.current} to latest`);
          } catch (error) {
            result.failed++;
            result.details.push(`Failed to update ${pkg.name}: ${error}`);
          }
        }
      }

      // Fix vulnerabilities
      if (depsResult.vulnerabilities && depsResult.vulnerabilities.length > 0) {
        try {
          execSync('npm audit fix', { stdio: 'pipe' });
          result.performed++;
          result.details.push('Fixed npm vulnerabilities');
        } catch (error) {
          result.failed++;
          result.details.push(`Failed to fix vulnerabilities: ${error}`);
        }
      }

    } catch (error) {
      this.logger.error('Dependency repair failed', error);
      result.failed++;
      result.details.push(`Dependency repair failed: ${error}`);
    }

    return result;
  }

  private async repairSpecKit(specKitResult: any, options: RepairOptions): Promise<RepairResult> {
    const result: RepairResult = { performed: 0, failed: 0, details: [] };

    if (options.dryRun) {
      result.details.push('Would repair Spec Kit issues');
      return result;
    }

    try {
      // Install Spec Kit if missing
      if (!specKitResult.installed) {
        try {
          // Try to install Spec Kit (this would need to be implemented based on actual Spec Kit installation method)
          result.details.push('Spec Kit installation not implemented - manual installation required');
          result.failed++;
        } catch (error) {
          result.failed++;
          result.details.push(`Failed to install Spec Kit: ${error}`);
        }
      }

      // Fix structure issues
      if (specKitResult.issues && specKitResult.issues.length > 0) {
        for (const issue of specKitResult.issues) {
          try {
            if (issue.includes('Missing required directory')) {
              const dirName = issue.match(/Missing required directory: (.+)/)?.[1];
              if (dirName) {
                const dirPath = path.join(process.cwd(), dirName);
                fs.mkdirSync(dirPath, { recursive: true });
                result.performed++;
                result.details.push(`Created directory: ${dirName}`);
              }
            } else if (issue.includes('Missing template file')) {
              const fileName = issue.match(/Missing template file: (.+)/)?.[1];
              if (fileName) {
                const filePath = path.join(process.cwd(), fileName);
                const templateContent = this.getDefaultTemplateContent(fileName);
                fs.writeFileSync(filePath, templateContent);
                result.performed++;
                result.details.push(`Created template file: ${fileName}`);
              }
            }
          } catch (error) {
            result.failed++;
            result.details.push(`Failed to fix Spec Kit issue: ${issue} - ${error}`);
          }
        }
      }

    } catch (error) {
      this.logger.error('Spec Kit repair failed', error);
      result.failed++;
      result.details.push(`Spec Kit repair failed: ${error}`);
    }

    return result;
  }

  private async repairConfiguration(configResult: any, options: RepairOptions): Promise<RepairResult> {
    const result: RepairResult = { performed: 0, failed: 0, details: [] };

    if (options.dryRun) {
      result.details.push('Would repair configuration issues');
      return result;
    }

    try {
      if (configResult.issues && configResult.issues.length > 0) {
        for (const issue of configResult.issues) {
          try {
            if (issue.severity === 'error') {
              // Only attempt to fix critical issues
              if (issue.file === 'package.json' && issue.type === 'invalid') {
                await this.repairPackageJson(issue);
                result.performed++;
                result.details.push(`Fixed package.json issue: ${issue.message}`);
              } else if (issue.file === 'tsconfig.json' && issue.type === 'invalid') {
                await this.repairTsConfig(issue);
                result.performed++;
                result.details.push(`Fixed tsconfig.json issue: ${issue.message}`);
              }
            }
          } catch (error) {
            result.failed++;
            result.details.push(`Failed to fix configuration issue: ${issue.message} - ${error}`);
          }
        }
      }

    } catch (error) {
      this.logger.error('Configuration repair failed', error);
      result.failed++;
      result.details.push(`Configuration repair failed: ${error}`);
    }

    return result;
  }

  private async createBackup(filePath: string): Promise<void> {
    const backupPath = `${filePath}.backup.${Date.now()}`;
    fs.copyFileSync(filePath, backupPath);
    this.logger.info(`Created backup: ${backupPath}`);
  }

  private getDefaultTemplateContent(fileName: string): string {
    const templates: Record<string, string> = {
      'spec-template.md': `# Feature Specification: [FEATURE_NAME]

## Overview
Brief description of what this feature accomplishes and why it's needed.

## User Stories
- **As a** [user type], **I want** [functionality] **so that** [benefit]

## Functional Requirements
1. [Requirement 1]
2. [Requirement 2]

## Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
`,
      'plan-template.md': `# Implementation Plan: [FEATURE_NAME]

## Technical Approach
High-level description of the technical approach and architecture decisions.

## Implementation Strategy
### Phase 1: Foundation
- [Task 1]
- [Task 2]

## Success Metrics
- [Metric 1]
- [Metric 2]
`,
      'tasks-template.md': `# Task List: [FEATURE_NAME]

## Tasks
- [ ] [Task 1]
- [ ] [Task 2]
- [ ] [Task 3]

## Dependencies
- [Dependency 1]
- [Dependency 2]
`
    };

    return templates[fileName] || `# ${fileName}\n\nContent placeholder.`;
  }

  private async repairPackageJson(issue: any): Promise<void> {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    if (issue.message.includes('Missing "name" field')) {
      packageJson.name = 'my-project';
    }

    if (issue.message.includes('Missing "version" field')) {
      packageJson.version = '1.0.0';
    }

    if (issue.message.includes('Missing "scripts" section')) {
      packageJson.scripts = {
        build: 'echo "Build script not implemented"',
        test: 'echo "Test script not implemented"',
        lint: 'echo "Lint script not implemented"'
      };
    }

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }

  private async repairTsConfig(issue: any): Promise<void> {
    const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
    const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));

    if (issue.message.includes('Missing "compilerOptions"')) {
      tsConfig.compilerOptions = {
        target: 'ES2022',
        module: 'CommonJS',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true
      };
    }

    fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));
  }
}
