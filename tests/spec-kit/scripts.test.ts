import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

describe('Spec Kit Integration Scripts', () => {
  const projectRoot = process.cwd();
  
  describe('Directory Structure', () => {
    it('should have memory directory with constitution', () => {
      const constitutionPath = join(projectRoot, 'memory', 'constitution.md');
      expect(existsSync(constitutionPath)).toBe(true);
      
      const constitution = readFileSync(constitutionPath, 'utf-8');
      expect(constitution).toContain('Project Constitution');
      expect(constitution.length).toBeGreaterThan(100);
    });

    it('should have specs directory with .gitkeep', () => {
      const specsPath = join(projectRoot, 'specs');
      const gitkeepPath = join(specsPath, '.gitkeep');
      
      expect(existsSync(specsPath)).toBe(true);
      expect(existsSync(gitkeepPath)).toBe(true);
    });

    it('should have templates directory with all required templates', () => {
      const templatesPath = join(projectRoot, 'templates');
      const requiredTemplates = [
        'spec-template.md',
        'plan-template.md',
        'constitution-template.md'
      ];

      requiredTemplates.forEach(template => {
        const templatePath = join(templatesPath, template);
        expect(existsSync(templatePath)).toBe(true);
        
        const content = readFileSync(templatePath, 'utf-8');
        expect(content.length).toBeGreaterThan(50);
      });
    });
  });

  describe('Package.json Scripts', () => {
    let packageJson: any;

    beforeEach(() => {
      const packagePath = join(projectRoot, 'package.json');
      packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
    });

    it('should have all required Spec Kit scripts', () => {
      const requiredScripts = [
        'spec:clarify',
        'spec:plan',
        'spec:implement',
        'spec:validate',
        'spec:research'
      ];

      requiredScripts.forEach(script => {
        expect(packageJson.scripts[script]).toBeDefined();
        expect(packageJson.scripts[script]).toContain('specify');
      });
    });

    it('should have git automation scripts', () => {
      const gitScripts = [
        'git:create-branch',
        'git:create-issue',
        'git:create-pr',
        'git:automation'
      ];

      gitScripts.forEach(script => {
        expect(packageJson.scripts[script]).toBeDefined();
        expect(packageJson.scripts[script]).toContain('bash scripts/');
      });
    });

    it('should have Spec Kit setup and verification scripts', () => {
      expect(packageJson.scripts['spec-kit:setup']).toBeDefined();
      expect(packageJson.scripts['spec-kit:verify']).toBeDefined();
    });
  });

  describe('Cursor Rules Integration', () => {
    it('should have Spec Kit rule file', () => {
      const specKitRulePath = join(projectRoot, '.cursor', 'rules', '06-spec-kit.mdc');
      expect(existsSync(specKitRulePath)).toBe(true);
      
      const content = readFileSync(specKitRulePath, 'utf-8');
      expect(content).toContain('Spec Kit Integration');
      expect(content.length).toBeGreaterThan(100);
    });

    it('should not have OpenSpec references in rules', () => {
      const rulesPath = join(projectRoot, '.cursor', 'rules');
      const ruleFiles = [
        '00-core.mdc',
        '01-workflow.mdc',
        '02-quality.mdc',
        '06-spec-kit.mdc'
      ];

      ruleFiles.forEach(file => {
        const filePath = join(rulesPath, file);
        if (existsSync(filePath)) {
          const content = readFileSync(filePath, 'utf-8');
          // Should not contain OpenSpec references (except in comments about removal)
          const openspecMatches = content.match(/OpenSpec/g);
          if (openspecMatches) {
            // Only allow references in comments about removal
            const commentMatches = content.match(/\/\/.*OpenSpec|#.*OpenSpec|\*.*OpenSpec/g);
            expect(openspecMatches.length).toBeLessThanOrEqual(commentMatches?.length || 0);
          }
        }
      });
    });
  });

  describe('Git Automation Scripts', () => {
    const requiredScripts = [
      'git-automation.sh',
      'create-issue.sh',
      'create-branch.sh',
      'create-pr.sh'
    ];

    requiredScripts.forEach(script => {
      it(`should have ${script} script`, () => {
        const scriptPath = join(projectRoot, 'scripts', script);
        expect(existsSync(scriptPath)).toBe(true);
        
        const content = readFileSync(scriptPath, 'utf-8');
        expect(content).toContain('#!/bin/bash');
        expect(content.length).toBeGreaterThan(50);
      });
    });
  });

  describe('Spec Kit Setup and Verification', () => {
    it('should have spec-kit-setup.sh script', () => {
      const setupScriptPath = join(projectRoot, 'scripts', 'spec-kit-setup.sh');
      expect(existsSync(setupScriptPath)).toBe(true);
      
      const content = readFileSync(setupScriptPath, 'utf-8');
      expect(content).toContain('Spec Kit');
      expect(content).toContain('installation');
    });

    it('should have verify-spec-kit.sh script', () => {
      const verifyScriptPath = join(projectRoot, 'scripts', 'verify-spec-kit.sh');
      expect(existsSync(verifyScriptPath)).toBe(true);
      
      const content = readFileSync(verifyScriptPath, 'utf-8');
      expect(content).toContain('Spec Kit Verification');
      expect(content).toContain('check_spec_kit_installation');
    });
  });

  describe('Documentation', () => {
    it('should have Spec Kit guide', () => {
      const guidePath = join(projectRoot, 'docs', 'SPEC_KIT_GUIDE.md');
      expect(existsSync(guidePath)).toBe(true);
      
      const content = readFileSync(guidePath, 'utf-8');
      expect(content).toContain('Spec Kit Integration Guide');
      expect(content.length).toBeGreaterThan(200);
    });

    it('should have updated PRD with Spec Kit integration', () => {
      const prdPath = join(projectRoot, 'docs', 'PRD.md');
      expect(existsSync(prdPath)).toBe(true);
      
      const content = readFileSync(prdPath, 'utf-8');
      expect(content).toContain('Spec Kit Integration');
      // Should not contain OpenSpec references
      expect(content).not.toContain('OpenSpec');
    });

    it('should have updated README with Spec Kit information', () => {
      const readmePath = join(projectRoot, 'README.md');
      expect(existsSync(readmePath)).toBe(true);
      
      const content = readFileSync(readmePath, 'utf-8');
      expect(content).toContain('Spec Kit integration');
      expect(content).toContain('AI-powered development workflow');
    });
  });

  describe('Example Specifications', () => {
    it('should have example specifications in specs directory', () => {
      const exampleSpecs = [
        'example-user-authentication.md',
        'example-api-integration.md'
      ];

      exampleSpecs.forEach(spec => {
        const specPath = join(projectRoot, 'specs', spec);
        expect(existsSync(specPath)).toBe(true);
        
        const content = readFileSync(specPath, 'utf-8');
        expect(content).toContain('Specification');
        expect(content.length).toBeGreaterThan(500);
      });
    });
  });

  describe('Script Execution (Mock)', () => {
    it('should have executable scripts', () => {
      const scripts = [
        'scripts/verify-spec-kit.sh',
        'scripts/spec-kit-setup.sh',
        'scripts/git-automation.sh'
      ];

      scripts.forEach(script => {
        const scriptPath = join(projectRoot, script);
        if (existsSync(scriptPath)) {
          // Check if script has proper shebang
          const content = readFileSync(scriptPath, 'utf-8');
          expect(content).toMatch(/^#!/);
        }
      });
    });
  });
});
