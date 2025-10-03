import fs from 'fs';
import path from 'path';

export interface UpdateCheckConfig {
  updateCheck: {
    enabled: boolean;
    checkInterval: 'daily' | 'weekly' | 'monthly';
    autoRepair: boolean;
    notifications: {
      console: boolean;
      file: boolean;
      email: boolean;
    };
  };
  checks: {
    dependencies: boolean;
    specKit: boolean;
    configuration: boolean;
    projectStructure: boolean;
  };
  repairs: {
    autoFix: boolean;
    backupChanges: boolean;
    allowedRepairs: string[];
  };
}

export class ConfigManager {
  private configPath: string;
  private defaultConfig: UpdateCheckConfig;

  constructor() {
    this.configPath = path.join(process.cwd(), '.update-check.json');
    this.defaultConfig = {
      updateCheck: {
        enabled: true,
        checkInterval: 'daily',
        autoRepair: false,
        notifications: {
          console: true,
          file: true,
          email: false
        }
      },
      checks: {
        dependencies: true,
        specKit: true,
        configuration: true,
        projectStructure: true
      },
      repairs: {
        autoFix: false,
        backupChanges: true,
        allowedRepairs: ['dependencies', 'configuration']
      }
    };
  }

  async load(): Promise<UpdateCheckConfig> {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, 'utf8');
        return { ...this.defaultConfig, ...JSON.parse(configData) };
      }
      return this.defaultConfig;
    } catch {
      // Failed to load config, using defaults
      return this.defaultConfig;
    }
  }

  async save(config: UpdateCheckConfig): Promise<void> {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
    } catch (error) {
      throw new Error(`Failed to save config: ${error}`);
    }
  }

  async initialize(): Promise<void> {
    if (!fs.existsSync(this.configPath)) {
      await this.save(this.defaultConfig);
    }
  }
}
