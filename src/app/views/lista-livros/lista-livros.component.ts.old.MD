import { Component, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription, map, switchMap } from 'rxjs';
import { Item, Livro } from 'src/app/models/interfaces';
import { LivroVolumeInfo } from 'src/app/models/livroVolumeInfo';
import { LivroService } from 'src/app/service/livro.service';

@Component({
  selector: 'app-lista-livros',
  templateUrl: './lista-livros.component.html',
  styleUrls: ['./lista-livros.component.css']
})
//export class ListaLivrosComponent implements OnDestroy {
export class ListaLivrosComponent {

  //listaLivros: Livro[];
  //livro: Livro
  campoBusca = new FormControl()
  //subscription: Subscription

  constructor(private service: LivroService) { }

  livrosEncontrados$ = this.campoBusca.valueChanges
    .pipe(
        switchMap(valorDigitado => this.service.buscar(valorDigitado)),
        map(items => this.livrosResultadoParaLivros(items))
    )


  // buscarLivros(){
  //   this.subscription = this.service.buscar(this.campoBusca).subscribe({
  //     next: (items) => {
  //       this.listaLivros = this.livrosResultadoParaLivros(items)
  //     },
  //     error: error => console.log(error),
  //     complete: () => console.log('Observable completado'),
  //   });
  // }

  livrosResultadoParaLivros(items: Item[]): LivroVolumeInfo[] {
    return items.map(item => {
      return new LivroVolumeInfo(item)
    })
  }

  // ngOnDestroy(): void {
  //   this.subscription.unsubscribe();
  // }

}
