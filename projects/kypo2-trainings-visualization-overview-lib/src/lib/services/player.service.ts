import { Injectable } from '@angular/core';
import { User } from '@sentinel/auth';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  players: User[];

  constructor() { }

  setPlayers(players: User[]){
    this.players = players;
  }

  getPlayer(id: number){
    return this.players.find(player => player.id === id);
  }


}
