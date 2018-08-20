import { Injectable } from '@angular/core';
import { GameInformation } from '../shared/interfaces/game-information';
import { GameEvents } from '../shared/interfaces/game-events';
import { Http } from '@angular/http';

@Injectable()
/**
 * Fetches the data from the REST API.
 */
export class DataService {

  baseUrl = 'api'; // #TODO change to KYPO REST API URL when it's available & npm uninstall angular-in-memory-web-api
  constructor(private http: Http) { }

  /**
   * Fetches static game information data
   */
  getInformation(): Promise<GameInformation> {
    return this.http.get(`${this.baseUrl}/game_information`)
      .toPromise()
      .then(response => response.json().data as GameInformation);
  }

  /**
   * Fetches game events data
   */
  getEvents(): Promise<GameEvents> {
    return this.http.get(`${this.baseUrl}/events`)
      .toPromise()
      .then(response => response.json().data as GameEvents);  
  }
}
