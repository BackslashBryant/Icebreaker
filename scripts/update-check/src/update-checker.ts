import { Logger } from './logger';
import { ConfigManager } from './config-manager';
import { DependencyChecker } from './checkers/dependency-checker';
import { SpecKitChecker } from './checkers/spec-kit-checker';
import { ConfigurationChecker } from './checkers/configuration-checker';
import { RepairEngine } from './repair-engine';

export interface CheckOptions {
  verbose?: boolean;
  deps?: boolean;
  specKit?: boolean;
  config?: boolean;
}

export interface RepairOptions extends CheckOptions {
  dryRun?: boolean;
  backup?: boolean;
}

export interface CheckResults {
  hasIssues: boolean;
  dependencies?: any;
  specKit?: any;
  configuration?: any;
  repairsPerformed?: number;
  repairsFailed?: number;
}

export interface SystemStatus {
  nodejs: { version: string; status: string };
  npm: { version: string; status: string };
  specKit: { version: string; status: string };
  dependencies: { status: string };
  configuration: { status: string };
}

export class UpdateChecker {
  private logger: Logger;
  private config: ConfigManager;
  private dependencyChecker: DependencyChecker;
  private specKitChecker: SpecKitChecker;
  private configurationChecker: ConfigurationChecker;
  private repairEngine: RepairEngine;

  constructor(logger: Logger, config: ConfigManager) {
    this.logger = logger;
    this.config = config;
    this.dependencyChecker = new DependencyChecker(logger);
    this.specKitChecker = new SpecKitChecker(logger);
    this.configurationChecker = new ConfigurationChecker(logger);
    this.repairEngine = new RepairEngine(logger);
  }

  async runChecks(options: CheckOptions): Promise<CheckResults> {
    const config = await this.config.load();
    const results: CheckResults = { hasIssues: false };

    this.logger.info('Starting update checks', { options });

    // Check dependencies
    if (options.deps !== false && config.checks.dependencies) {
      try {
        results.dependencies = await this.dependencyChecker.check();
        if (results.dependencies.hasIssues) {
          results.hasIssues = true;
        }
      } catch (error) {
        this.logger.error('Dependency check failed', error);
        results.hasIssues = true;
      }
    }

    // Check Spec Kit
    if (options.specKit !== false && config.checks.specKit) {
      try {
        results.specKit = await this.specKitChecker.check();
        if (results.specKit.hasIssues) {
          results.hasIssues = true;
        }
      } catch (error) {
        this.logger.error('Spec Kit check failed', error);
        results.hasIssues = true;
      }
    }

    // Check configuration
    if (options.config !== false && config.checks.configuration) {
      try {
        results.configuration = await this.configurationChecker.check();
        if (results.configuration.hasIssues) {
          results.hasIssues = true;
        }
      } catch (error) {
        this.logger.error('Configuration check failed', error);
        results.hasIssues = true;
      }
    }

    this.logger.info('Update checks completed', { results });
    return results;
  }

  async runChecksWithRepair(options: RepairOptions): Promise<CheckResults> {
    const results = await this.runChecks(options);
    
    if (results.hasIssues) {
      const repairResults = await this.repairEngine.repair(results, options);
      results.repairsPerformed = repairResults.performed;
      results.repairsFailed = repairResults.failed;
    }

    return results;
  }

  async getStatus(): Promise<SystemStatus> {
    await this.config.load();
    
    // Get Node.js and npm versions
    const nodejsVersion = process.version;
    const npmVersion = await this.dependencyChecker.getNpmVersion();
    
    // Check Spec Kit status
    const specKitStatus = await this.specKitChecker.getStatus();
    
    // Check dependencies status
    const depsStatus = await this.dependencyChecker.getStatus();
    
    // Check configuration status
    const configStatus = await this.configurationChecker.getStatus();

    return {
      nodejs: { version: nodejsVersion, status: 'ok' },
      npm: { version: npmVersion, status: 'ok' },
      specKit: { version: specKitStatus.version, status: specKitStatus.status },
      dependencies: { status: depsStatus.status },
      configuration: { status: configStatus.status }
    };
  }
}
