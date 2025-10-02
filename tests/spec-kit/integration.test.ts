import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

describe('Spec Kit Integration Tests', () => {
  const projectRoot = process.cwd();

  describe('Constitution Validation', () => {
    it('should have a valid constitution with all required sections', () => {
      const constitutionPath = join(projectRoot, 'memory', 'constitution.md');
      const constitution = readFileSync(constitutionPath, 'utf-8');

      const requiredSections = [
        'Core Principles',
        'Development Standards',
        'Technology Stack',
        'Project Structure',
        'Quality Gates',
        'Security Guidelines',
        'Performance Standards',
        'Deployment Strategy',
        'Change Management',
        'Success Metrics'
      ];

      requiredSections.forEach(section => {
        expect(constitution).toContain(section);
      });
    });

    it('should have constitution with proper formatting', () => {
      const constitutionPath = join(projectRoot, 'memory', 'constitution.md');
      const constitution = readFileSync(constitutionPath, 'utf-8');

      // Should have proper markdown structure
      expect(constitution).toContain('# Project Constitution');
      expect(constitution).toContain('## ');
      expect(constitution).toContain('### ');
      expect(constitution).toContain('- ');
    });
  });

  describe('Template Validation', () => {
    it('should have valid spec template', () => {
      const specTemplatePath = join(projectRoot, 'templates', 'spec-template.md');
      const template = readFileSync(specTemplatePath, 'utf-8');

      expect(template).toContain('Specification');
      expect(template).toContain('Overview');
      expect(template).toContain('Requirements');
      expect(template).toContain('Technical Specifications');
      expect(template).toContain('Implementation Plan');
    });

    it('should have valid plan template', () => {
      const planTemplatePath = join(projectRoot, 'templates', 'plan-template.md');
      const template = readFileSync(planTemplatePath, 'utf-8');

      expect(template).toContain('Implementation Plan');
      expect(template).toContain('Tasks');
      expect(template).toContain('Timeline');
      expect(template).toContain('Success Criteria');
    });

    it('should have valid constitution template', () => {
      const constitutionTemplatePath = join(projectRoot, 'templates', 'constitution-template.md');
      const template = readFileSync(constitutionTemplatePath, 'utf-8');

      expect(template).toContain('Project Constitution');
      expect(template).toContain('Core Principles');
      expect(template).toContain('Development Standards');
    });
  });

  describe('Workflow Integration', () => {
    it('should have proper Spec Kit workflow in cursor rules', () => {
      const workflowPath = join(projectRoot, '.cursor', 'rules', '01-workflow.mdc');
      const workflow = readFileSync(workflowPath, 'utf-8');

      expect(workflow).toContain('Spec Kit workflow');
      expect(workflow).toContain('constitution → clarify → plan → implement');
      expect(workflow).toContain('Automatic Spec Kit Usage Rules');
    });

    it('should have proper Spec Kit decision logic in core rules', () => {
      const corePath = join(projectRoot, '.cursor', 'rules', '00-core.mdc');
      const core = readFileSync(corePath, 'utf-8');

      expect(core).toContain('Automatic Spec Kit Integration');
      expect(core).toContain('Spec Kit Decision Logic');
      expect(core).toContain('Spec Kit Triggers');
    });
  });

  describe('Script Integration', () => {
    it('should have proper npm script fallbacks', () => {
      const packagePath = join(projectRoot, 'package.json');
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));

      const specScripts = [
        'spec:clarify',
        'spec:plan',
        'spec:implement',
        'spec:validate',
        'spec:research'
      ];

      specScripts.forEach(script => {
        const scriptContent = packageJson.scripts[script];
        expect(scriptContent).toContain('specify');
        expect(scriptContent).toContain('|| echo');
        expect(scriptContent).toContain('not installed');
      });
    });

    it('should have proper git automation integration', () => {
      const packagePath = join(projectRoot, 'package.json');
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));

      const gitScripts = [
        'git:create-branch',
        'git:create-issue',
        'git:create-pr',
        'git:automation'
      ];

      gitScripts.forEach(script => {
        const scriptContent = packageJson.scripts[script];
        expect(scriptContent).toContain('bash scripts/');
        expect(scriptContent).toContain(script.replace('git:', ''));
      });
    });
  });

  describe('Documentation Integration', () => {
    it('should have comprehensive Spec Kit guide', () => {
      const guidePath = join(projectRoot, 'docs', 'SPEC_KIT_GUIDE.md');
      const guide = readFileSync(guidePath, 'utf-8');

      const requiredSections = [
        'Installation',
        'How Spec Kit Works',
        'When Spec Kit is Used',
        'Automatic Triggers',
        'Manual Usage',
        'Integration with Cursor',
        'Troubleshooting',
        'Best Practices'
      ];

      requiredSections.forEach(section => {
        expect(guide).toContain(section);
      });
    });

    it('should have updated development guide', () => {
      const devGuidePath = join(projectRoot, 'docs', 'development', 'DEVELOPMENT.md');
      const devGuide = readFileSync(devGuidePath, 'utf-8');

      expect(devGuide).toContain('Spec Kit');
      expect(devGuide).toContain('GitHub Issues-first');
      expect(devGuide).toContain('MCP setup');
    });
  });

  describe('Example Specifications Quality', () => {
    it('should have high-quality example specifications', () => {
      const exampleSpecs = [
        'example-user-authentication.md',
        'example-api-integration.md'
      ];

      exampleSpecs.forEach(spec => {
        const specPath = join(projectRoot, 'specs', spec);
        const specContent = readFileSync(specPath, 'utf-8');

        // Should have proper structure
        expect(specContent).toContain('# ');
        expect(specContent).toContain('## Overview');
        expect(specContent).toContain('## Requirements');
        expect(specContent).toContain('## Technical Specifications');
        expect(specContent).toContain('## Implementation Plan');

        // Should be substantial content
        expect(specContent.length).toBeGreaterThan(1000);
      });
    });

    it('should have realistic example specifications', () => {
      const authSpecPath = join(projectRoot, 'specs', 'example-user-authentication.md');
      const authSpec = readFileSync(authSpecPath, 'utf-8');

      expect(authSpec).toContain('JWT tokens');
      expect(authSpec).toContain('bcrypt');
      expect(authSpec).toContain('API endpoints');
      expect(authSpec).toContain('Database schema');
      expect(authSpec).toContain('Security considerations');

      const apiSpecPath = join(projectRoot, 'specs', 'example-api-integration.md');
      const apiSpec = readFileSync(apiSpecPath, 'utf-8');

      expect(apiSpec).toContain('Stripe');
      expect(apiSpec).toContain('PCI DSS');
      expect(apiSpec).toContain('payment processing');
      expect(apiSpec).toContain('webhooks');
    });
  });

  describe('Error Handling and Fallbacks', () => {
    it('should have proper error handling in scripts', () => {
      const verifyScriptPath = join(projectRoot, 'scripts', 'verify-spec-kit.sh');
      const verifyScript = readFileSync(verifyScriptPath, 'utf-8');

      expect(verifyScript).toContain('set -e');
      expect(verifyScript).toContain('log_error');
      expect(verifyScript).toContain('log_warning');
      expect(verifyScript).toContain('return 1');
    });

    it('should have graceful fallbacks in npm scripts', () => {
      const packagePath = join(projectRoot, 'package.json');
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));

      const specScripts = [
        'spec:clarify',
        'spec:plan',
        'spec:implement',
        'spec:validate',
        'spec:research'
      ];

      specScripts.forEach(script => {
        const scriptContent = packageJson.scripts[script];
        expect(scriptContent).toContain('|| echo');
        expect(scriptContent).toContain('skipping');
      });
    });
  });

  describe('Performance and Quality', () => {
    it('should have optimized rule files', () => {
      const ruleFiles = [
        '00-core.mdc',
        '01-workflow.mdc',
        '02-quality.mdc',
        '06-spec-kit.mdc'
      ];

      ruleFiles.forEach(file => {
        const rulePath = join(projectRoot, '.cursor', 'rules', file);
        if (existsSync(rulePath)) {
          const content = readFileSync(rulePath, 'utf-8');
          // Rule files should be reasonably sized (not bloated)
          expect(content.length).toBeLessThan(10000);
          expect(content.length).toBeGreaterThan(100);
        }
      });
    });

    it('should have no redundant content', () => {
      const corePath = join(projectRoot, '.cursor', 'rules', '00-core.mdc');
      const qualityPath = join(projectRoot, '.cursor', 'rules', '02-quality.mdc');
      
      const coreContent = readFileSync(corePath, 'utf-8');
      const qualityContent = readFileSync(qualityPath, 'utf-8');

      // Should not have duplicate git workflow sections
      const coreGitWorkflow = (coreContent.match(/git workflow/gi) || []).length;
      const qualityGitWorkflow = (qualityContent.match(/git workflow/gi) || []).length;
      
      // Quality should be the canonical source for git workflow
      expect(qualityGitWorkflow).toBeGreaterThan(coreGitWorkflow);
    });
  });
});
