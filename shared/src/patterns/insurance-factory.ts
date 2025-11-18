// ===============================================
// FACTORY PATTERN - Insurance Policy Factory
// ===============================================

/**
 * Base Insurance Interface
 * All insurance types must implement this interface
 */
export interface IInsurance {
  type: string;
  calculatePremium(): number;
  validate(): boolean;
  getDetails(): Record<string, any>;
}

/**
 * Insurance Data Transfer Objects (DTOs)
 */
export interface BaseInsuranceData {
  userId: number;
  coverageAmount: number;
  startDate: Date;
  endDate: Date;
}

export interface LifeInsuranceData extends BaseInsuranceData {
  age: number;
  medicalHistory: string;
  smoker: boolean;
  beneficiaries: Array<{
    name: string;
    relationship: string;
    percentage: number;
  }>;
}

export interface RentInsuranceData extends BaseInsuranceData {
  address: string;
  propertyValue: number;
  usageType: 'residential' | 'commercial';
  squareMeters: number;
}

export interface VehicleInsuranceData extends BaseInsuranceData {
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
}

/**
 * Abstract Base Insurance Class
 */
export abstract class BaseInsurance implements IInsurance {
  public type: string;
  protected userId: number;
  protected coverageAmount: number;
  protected startDate: Date;
  protected endDate: Date;
  protected basePremium: number;

  constructor(data: BaseInsuranceData, type: string, basePremium: number) {
    this.type = type;
    this.userId = data.userId;
    this.coverageAmount = data.coverageAmount;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.basePremium = basePremium;
  }

  abstract calculatePremium(): number;
  abstract validate(): boolean;
  abstract getDetails(): Record<string, any>;

  protected calculateDurationInMonths(): number {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return months || 1;
  }
}

/**
 * Life Insurance Implementation
 */
export class LifeInsurance extends BaseInsurance {
  private age: number;
  private medicalHistory: string;
  private smoker: boolean;
  private beneficiaries: Array<{ name: string; relationship: string; percentage: number }>;

  constructor(data: LifeInsuranceData) {
    super(data, 'life', 100);
    this.age = data.age;
    this.medicalHistory = data.medicalHistory;
    this.smoker = data.smoker;
    this.beneficiaries = data.beneficiaries;
  }

  calculatePremium(): number {
    let premium = this.basePremium;

    // Age factor: +2% per year over 30
    if (this.age > 30) {
      premium *= 1 + ((this.age - 30) * 0.02);
    }

    // Smoker penalty: +50%
    if (this.smoker) {
      premium *= 1.5;
    }

    // Coverage amount factor
    premium += (this.coverageAmount / 100000) * 10;

    // Duration factor
    const months = this.calculateDurationInMonths();
    return Math.round(premium * months * 100) / 100;
  }

  validate(): boolean {
    if (this.age < 18 || this.age > 80) return false;
    if (this.coverageAmount <= 0) return false;
    if (this.beneficiaries.length === 0) return false;

    // Validate beneficiaries percentages sum to 100
    const totalPercentage = this.beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
    if (totalPercentage !== 100) return false;

    return true;
  }

  getDetails(): Record<string, any> {
    return {
      age: this.age,
      medical_history: this.medicalHistory,
      smoker: this.smoker,
      beneficiaries: this.beneficiaries,
    };
  }
}

/**
 * Rent Insurance Implementation
 */
export class RentInsurance extends BaseInsurance {
  private address: string;
  private propertyValue: number;
  private usageType: 'residential' | 'commercial';
  private squareMeters: number;

  constructor(data: RentInsuranceData) {
    super(data, 'rent', 50);
    this.address = data.address;
    this.propertyValue = data.propertyValue;
    this.usageType = data.usageType;
    this.squareMeters = data.squareMeters;
  }

  calculatePremium(): number {
    let premium = this.basePremium;

    // Property value factor
    premium += (this.propertyValue / 100000) * 5;

    // Usage type factor: commercial +30%
    if (this.usageType === 'commercial') {
      premium *= 1.3;
    }

    // Size factor
    premium += (this.squareMeters / 100) * 3;

    // Duration factor
    const months = this.calculateDurationInMonths();
    return Math.round(premium * months * 100) / 100;
  }

  validate(): boolean {
    if (!this.address || this.address.trim().length === 0) return false;
    if (this.propertyValue <= 0) return false;
    if (this.squareMeters <= 0) return false;
    if (this.coverageAmount <= 0) return false;
    return true;
  }

  getDetails(): Record<string, any> {
    return {
      address: this.address,
      property_value: this.propertyValue,
      usage_type: this.usageType,
      square_meters: this.squareMeters,
    };
  }
}

/**
 * Vehicle Insurance Implementation
 */
export class VehicleInsurance extends BaseInsurance {
  private make: string;
  private model: string;
  private year: number;
  private vin: string;
  private licensePlate: string;

  constructor(data: VehicleInsuranceData) {
    super(data, 'vehicle', 75);
    this.make = data.make;
    this.model = data.model;
    this.year = data.year;
    this.vin = data.vin;
    this.licensePlate = data.licensePlate;
  }

  calculatePremium(): number {
    let premium = this.basePremium;

    // Vehicle age factor
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - this.year;

    if (vehicleAge > 10) {
      premium *= 1.3; // Older vehicles +30%
    } else if (vehicleAge < 3) {
      premium *= 1.2; // New vehicles +20% (higher value)
    }

    // Coverage amount factor
    premium += (this.coverageAmount / 50000) * 8;

    // Duration factor
    const months = this.calculateDurationInMonths();
    return Math.round(premium * months * 100) / 100;
  }

  validate(): boolean {
    if (!this.make || this.make.trim().length === 0) return false;
    if (!this.model || this.model.trim().length === 0) return false;
    if (this.year < 1900 || this.year > new Date().getFullYear() + 1) return false;
    if (!this.vin || this.vin.length !== 17) return false;
    if (!this.licensePlate || this.licensePlate.trim().length === 0) return false;
    if (this.coverageAmount <= 0) return false;
    return true;
  }

  getDetails(): Record<string, any> {
    return {
      make: this.make,
      model: this.model,
      year: this.year,
      vin: this.vin,
      license_plate: this.licensePlate,
    };
  }
}

/**
 * Insurance Factory - Factory Method Pattern
 * Creates insurance instances based on type
 */
export class InsuranceFactory {
  /**
   * Create an insurance instance based on type
   */
  static createInsurance(
    type: 'life' | 'rent' | 'vehicle',
    data: LifeInsuranceData | RentInsuranceData | VehicleInsuranceData
  ): IInsurance {
    switch (type) {
      case 'life':
        return new LifeInsurance(data as LifeInsuranceData);
      case 'rent':
        return new RentInsurance(data as RentInsuranceData);
      case 'vehicle':
        return new VehicleInsurance(data as VehicleInsuranceData);
      default:
        throw new Error(`Unknown insurance type: ${type}`);
    }
  }

  /**
   * Get available insurance types
   */
  static getAvailableTypes(): string[] {
    return ['life', 'rent', 'vehicle'];
  }

  /**
   * Validate insurance type
   */
  static isValidType(type: string): boolean {
    return this.getAvailableTypes().includes(type);
  }
}


