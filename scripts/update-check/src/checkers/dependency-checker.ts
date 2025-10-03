import { execSync } from 'child_process';
import axios from 'axios';
import semver from 'semver';
import { Logger } from '../logger';

export interface DependencyCheckResult {
  hasIssues: boolean;
  outdated: Array<{
    name: string;
    current: string;
    latest: string;
    type: 'dependencies' | 'devDependencies';
  }>;
  vulnerabilities: Array<{
    name: string;
    severity: string;
    description: string;
  }>;
}

export interface DependencyStatus {
  status: 'ok' | 'outdated' | 'vulnerable' | 'error';
  outdatedCount: number;
  vulnerableCount: number;
}

export class DependencyChecker {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async check(): Promise<DependencyCheckResult> {
    this.logger.info('Checking dependencies...');
    
    const result: DependencyCheckResult = {
      hasIssues: false,
      outdated: [],
      vulnerabilities: []
    };

    try {
      // Get package.json
      const packageJson = this.getPackageJson();
      if (!packageJson) {
        this.logger.warn('No package.json found');
        return result;
      }

      // Check for outdated packages
      const outdated = await this.checkOutdatedPackages(packageJson);
      result.outdated = outdated;
      
      if (outdated.length > 0) {
        result.hasIssues = true;
      }

      // Check for vulnerabilities
      const vulnerabilities = await this.checkVulnerabilities();
      result.vulnerabilities = vulnerabilities;
      
      if (vulnerabilities.length > 0) {
        result.hasIssues = true;
      }

      this.logger.info('Dependency check completed', { 
        outdated: outdated.length, 
        vulnerabilities: vulnerabilities.length 
      });

    } catch (err) {
      this.logger.error('Dependency check failed', err);
      result.hasIssues = true;
    }

    return result;
  }

  async getStatus(): Promise<DependencyStatus> {
    try {
      const result = await this.check();
      return {
        status: result.hasIssues ? 'outdated' : 'ok',
        outdatedCount: result.outdated.length,
        vulnerableCount: result.vulnerabilities.length
      };
    } catch {
      return {
        status: 'error',
        outdatedCount: 0,
        vulnerableCount: 0
      };
    }
  }

  async getNpmVersion(): Promise<string> {
    try {
      const version = execSync('npm --version', { encoding: 'utf8' }).trim();
      return version;
    } catch {
      return 'unknown';
    }
  }

  private getPackageJson(): any {
    try {
      const fs = require('fs');
      const path = require('path');
      const packagePath = path.join(process.cwd(), 'package.json');
      
      if (fs.existsSync(packagePath)) {
        return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      }
      return null;
    } catch (error) {
      this.logger.error('Failed to read package.json', error);
      return null;
    }
  }

  private async checkOutdatedPackages(packageJson: any): Promise<Array<{
    name: string;
    current: string;
    latest: string;
    type: 'dependencies' | 'devDependencies';
  }>> {
    const outdated: Array<{
      name: string;
      current: string;
      latest: string;
      type: 'dependencies' | 'devDependencies';
    }> = [];

    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };

    for (const [name, version] of Object.entries(allDeps)) {
      try {
        const latestVersion = await this.getLatestVersion(name);
        const currentVersion = (version as string).replace(/^[\^~]/, '');
        
        if (latestVersion && semver.gt(latestVersion, currentVersion)) {
          const type = packageJson.dependencies?.[name] ? 'dependencies' : 'devDependencies';
          outdated.push({
            name,
            current: version as string,
            latest: latestVersion,
            type
          });
        }
      } catch (error) {
        this.logger.debug(`Failed to check version for ${name}`, error);
      }
    }

    return outdated;
  }

  private async getLatestVersion(packageName: string): Promise<string | null> {
    try {
      const response = await axios.get(`https://registry.npmjs.org/${packageName}/latest`, {
        timeout: 5000
      });
      return response.data.version;
    } catch (error) {
      this.logger.debug(`Failed to get latest version for ${packageName}`, error);
      return null;
    }
  }

  private async checkVulnerabilities(): Promise<Array<{
    name: string;
    severity: string;
    description: string;
  }>> {
    try {
      const auditResult = execSync('npm audit --json', { encoding: 'utf8' });
      const audit = JSON.parse(auditResult);
      
      const vulnerabilities: Array<{
        name: string;
        severity: string;
        description: string;
      }> = [];

      if (audit.vulnerabilities) {
        for (const [name, vuln] of Object.entries(audit.vulnerabilities)) {
          const v = vuln as any;
          vulnerabilities.push({
            name,
            severity: v.severity || 'unknown',
            description: v.title || 'No description available'
          });
        }
      }

      return vulnerabilities;
    } catch (error) {
      this.logger.debug('Failed to check vulnerabilities', error);
      return [];
    }
  }
}
