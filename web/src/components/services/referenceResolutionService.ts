import { getResources } from "../../api/api";


export interface ReferenceMaps {
  parties: Map<string, string>; // partyName -> partyId
  cities: Map<string, string>; // cityName -> cityId  
  states: Map<string, string>; // stateName -> stateId
  agencies: Map<string, string>; // agencyName -> agencyId
  resellers: Map<string, string>;
}

export class ReferenceResolutionService {
  private static cache: ReferenceMaps = {
    parties: new Map(),
    cities: new Map(),
    states: new Map(),
     agencies: new Map(),
     resellers: new Map()
  };

  static async initialize(): Promise<void> {
    await Promise.all([
      this.loadParties(),
      this.loadCities(),
      this.loadStates(),
      this.loadAgencies(),
      this.loadResellers()
    ]);
  }

  private static async loadParties(): Promise<void> {
    try {
      const parties = await getResources('/parties?showInactive=true') as any[];
      parties.forEach(party => {
        if (party.partyName && party._id) {
          this.cache.parties.set(party.partyName.toLowerCase(), party._id);
        }
      });
    } catch (error) {
      console.error('Failed to load parties:', error);
    }
  }

  private static async loadCities(): Promise<void> {
    try {
      const cities = await getResources('/cities?showInactive=true') as any[];
      cities.forEach(city => {
        if (city.cityName && city._id) {
          this.cache.cities.set(city.cityName.toLowerCase(), city._id);
        }
      });
    } catch (error) {
      console.error('Failed to load cities:', error);
    }
  }

  private static async loadStates(): Promise<void> {
    try {
      const states = await getResources('/states?showInactive=true') as any[];
      states.forEach(state => {
        if (state.stateName && state._id) {
          this.cache.states.set(state.stateName.toLowerCase(), state._id);
        }
      });
    } catch (error) {
      console.error('Failed to load states:', error);
    }
  }

    private static async loadAgencies(): Promise<void> {
    try {
      const agencies = await getResources('/agency?showInactive=true') as any[];
      agencies.forEach(agency => {
        if (agency.agencyName && agency._id) {
          this.cache.agencies.set(agency.agencyName.toLowerCase(), agency._id);
        }
      });
    } catch (error) {
      console.error('Failed to load agencies:', error);
    }
  }

    private static async loadResellers(): Promise<void> {
    try {
      const resellers = await getResources('/resellers?showInactive=true') as any[];
      resellers.forEach(reseller => {
        if (reseller.resellerName && reseller._id) {
          this.cache.resellers.set(reseller.resellerName.toLowerCase(), reseller._id);
        }
      });
    } catch (error) {
      console.error('Failed to load resellers:', error);
    }
  }

  static resolveParty(partyName: string): string | null {
    return this.cache.parties.get(partyName.toLowerCase()) || null;
  }

  static resolveCity(cityName: string): string | null {
    return this.cache.cities.get(cityName.toLowerCase()) || null;
  }

  static resolveState(stateName: string): string | null {
    return this.cache.states.get(stateName.toLowerCase()) || null;
  }

    static resolveAgency(agencyName: string): string | null {
    return this.cache.agencies.get(agencyName.toLowerCase()) || null;
  }

  
  static resolveReseller(resellerName: string): string | null {
    return this.cache.resellers.get(resellerName.toLowerCase()) || null;
  }

  static clearCache(): void {
    this.cache.parties.clear();
    this.cache.cities.clear();
    this.cache.states.clear();
     this.cache.agencies.clear();
    this.cache.resellers.clear();
  }
}