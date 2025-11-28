// Offline Detection Library for HerCircle Shield
// Provides rule-based detection when backend is unavailable

export class OfflineDetector {
  constructor() {
    this.patterns = this.initializePatterns();
  }

  initializePatterns() {
    return {
      harassment: {
        keywords: [
          'bitch', 'whore', 'slut', 'stupid woman', 'useless', 'worthless',
          'ugly', 'fat', 'disgusting', 'trash', 'garbage', 'pathetic'
        ],
        weight: 20,
        severity: 'medium'
      },
      threats: {
        keywords: [
          'kill', 'hurt', 'beat', 'rape', 'attack', 'destroy', 'murder',
          'harm', 'violence', 'die', 'death', 'shoot', 'stab'
        ],
        weight: 30,
        severity: 'critical'
      },
      doxxing: {
        keywords: [
          'address', 'phone number', 'id number', 'location', 'home',
          'workplace', 'live at', 'works at', 'real name', 'personal info'
        ],
        patterns: [
          /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/i, // Phone numbers
          /\b\d{5,}\s+[A-Za-z\s]+(?:street|st|avenue|ave|road|rd|drive|dr)\b/i, // Addresses
          /\b[A-Z]{2}\d{6,}\b/i // ID numbers
        ],
        weight: 25,
        severity: 'high'
      },
      financialControl: {
        keywords: [
          'money', 'pay me', 'owe', 'debt', 'control your money',
          'bank account', 'salary', 'give me money', 'financial'
        ],
        weight: 15,
        severity: 'medium'
      },
      coercion: {
        keywords: [
          'you must', 'you have to', 'or else', 'if you don\'t',
          'force', 'make you', 'no choice', 'obey', 'submit'
        ],
        weight: 20,
        severity: 'medium'
      },
      sexualHarassment: {
        keywords: [
          'send nudes', 'show me', 'sexy', 'body', 'naked',
          'sexual', 'intimate', 'private photos', 'explicit'
        ],
        weight: 25,
        severity: 'high'
      },
      africanSlang: {
        // Common GBV-related slang in African languages
        keywords: [
          'ashawo', 'runs girl', 'olosho', 'prostitute',
          'slay queen', 'gold digger', 'cheap', 'easy'
        ],
        weight: 20,
        severity: 'medium'
      },
      gaslighting: {
        keywords: [
          'you\'re crazy', 'imagining things', 'overreacting',
          'too sensitive', 'dramatic', 'paranoid', 'making it up'
        ],
        weight: 18,
        severity: 'medium'
      }
    };
  }

  detect(text) {
    if (!text || text.length < 10) {
      return {
        isHarmful: false,
        detectionType: [],
        severity: 'low',
        confidence: 0,
        explanation: 'Text too short for analysis',
        aiModel: 'offline'
      };
    }

    const lowerText = text.toLowerCase();
    const detectionTypes = [];
    let totalWeight = 0;
    let maxSeverity = 'low';

    // Check each pattern category
    for (const [type, config] of Object.entries(this.patterns)) {
      let matched = false;

      // Check keywords
      if (config.keywords) {
        for (const keyword of config.keywords) {
          if (lowerText.includes(keyword.toLowerCase())) {
            matched = true;
            break;
          }
        }
      }

      // Check regex patterns
      if (!matched && config.patterns) {
        for (const pattern of config.patterns) {
          if (pattern.test(text)) {
            matched = true;
            break;
          }
        }
      }

      if (matched) {
        detectionTypes.push(type);
        totalWeight += config.weight;
        
        // Update severity
        if (this.compareSeverity(config.severity, maxSeverity) > 0) {
          maxSeverity = config.severity;
        }
      }
    }

    const isHarmful = detectionTypes.length > 0;
    const confidence = Math.min(totalWeight, 85); // Max 85% for offline

    return {
      isHarmful,
      detectionType: detectionTypes,
      severity: maxSeverity,
      confidence,
      explanation: isHarmful
        ? `Offline detection identified potential ${detectionTypes.join(', ')} based on pattern matching.`
        : 'No harmful patterns detected in offline analysis.',
      aiModel: 'offline'
    };
  }

  compareSeverity(sev1, sev2) {
    const levels = { low: 1, medium: 2, high: 3, critical: 4 };
    return levels[sev1] - levels[sev2];
  }

  // Batch detection
  detectBatch(texts) {
    return texts.map(text => this.detect(text));
  }
}

// Export singleton instance
export const offlineDetector = new OfflineDetector();
