#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { UpdateChecker } from './update-checker';
import { ConfigManager } from './config-manager';
import { Logger } from './logger';

const program = new Command();

program
  .name('update-check')
  .description('Update check and self-repair system for Cursor Template Project')
  .version('1.0.0');

program
  .command('check')
  .description('Run update checks for dependencies, Spec Kit, and configuration')
  .option('-v, --verbose', 'Enable verbose output')
  .option('--no-deps', 'Skip dependency checks')
  .option('--no-spec-kit', 'Skip Spec Kit checks')
  .option('--no-config', 'Skip configuration checks')
  .action(async (options) => {
    const logger = new Logger(options.verbose);
    const config = new ConfigManager();
    const checker = new UpdateChecker(logger, config);

    try {
      console.log(chalk.blue('🔍 Running update checks...'));
      const results = await checker.runChecks(options);
      
      if (results.hasIssues) {
        console.log(chalk.yellow('⚠️  Issues found. Run with --repair to fix them.'));
        process.exit(1);
      } else {
        console.log(chalk.green('✅ All checks passed!'));
        process.exit(0);
      }
    } catch (error) {
      logger.error('Update check failed:', error);
      process.exit(1);
    }
  });

program
  .command('repair')
  .description('Run update checks and automatically repair issues')
  .option('-v, --verbose', 'Enable verbose output')
  .option('--dry-run', 'Show what would be repaired without making changes')
  .option('--backup', 'Create backup before making changes', true)
  .action(async (options) => {
    const logger = new Logger(options.verbose);
    const config = new ConfigManager();
    const checker = new UpdateChecker(logger, config);

    try {
      console.log(chalk.blue('🔧 Running update checks with repair...'));
      const results = await checker.runChecksWithRepair(options);
      
      if (results.repairsPerformed && results.repairsPerformed > 0) {
        console.log(chalk.green(`✅ Repaired ${results.repairsPerformed} issues!`));
      } else {
        console.log(chalk.green('✅ No repairs needed!'));
      }
      
      process.exit(0);
    } catch (error) {
      logger.error('Repair failed:', error);
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Show current status of all components')
  .option('-v, --verbose', 'Enable verbose output')
  .action(async (options) => {
    const logger = new Logger(options.verbose);
    const config = new ConfigManager();
    const checker = new UpdateChecker(logger, config);

    try {
      console.log(chalk.blue('📊 Checking system status...'));
      const status = await checker.getStatus();
      
      console.log(`\n${chalk.bold('System Status:')}`);
      console.log(`Node.js: ${status.nodejs.version} (${status.nodejs.status})`);
      console.log(`npm: ${status.npm.version} (${status.npm.status})`);
      console.log(`Spec Kit: ${status.specKit.version} (${status.specKit.status})`);
      console.log(`Dependencies: ${status.dependencies.status}`);
      console.log(`Configuration: ${status.configuration.status}`);
      
      process.exit(0);
    } catch (error) {
      logger.error('Status check failed:', error);
      process.exit(1);
    }
  });

program
  .command('config')
  .description('Manage update check configuration')
  .option('--init', 'Initialize configuration file')
  .option('--show', 'Show current configuration')
  .action(async (options) => {
    const config = new ConfigManager();

    if (options.init) {
      await config.initialize();
      console.log(chalk.green('✅ Configuration initialized!'));
    } else if (options.show) {
      const currentConfig = await config.load();
      console.log(JSON.stringify(currentConfig, null, 2));
    } else {
      program.help();
    }
  });

program.parse();
