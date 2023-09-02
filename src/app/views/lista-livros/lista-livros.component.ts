import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { EMPTY, catchError, debounceTime, filter, map, switchMap, throwError } from 'rxjs';
import { Item } from 'src/app/models/interfaces';
import { LivroVolumeInfo } from 'src/app/models/livroVolumeInfo';
import { LivroService } from 'src/app/service/livro.service';

@Component({
  selector: 'app-lista-livros',
  templateUrl: './lista-livros.component.html',
  styleUrls: ['./lista-livros.component.css']
})
export class ListaLivrosComponent {

  campoBusca = new FormControl()

  constructor(private service: LivroService) { }

  mensagemErro = '';

  livrosEncontrados$ = this.campoBusca.valueChanges
    .pipe(
      debounceTime(2000),
      filter(valorDigitado => valorDigitado.length >= 3),
      switchMap(valorDigitado => this.service.buscar(valorDigitado)),
      map(items => this.livrosResultadoParaLivros(items)),
      catchError(() => {
        this.mensagemErro = 'Ops, ocorreu um erro. Recarregue a aplicação!'
        return EMPTY
      })
    )

  livrosResultadoParaLivros(items: Item[]): LivroVolumeInfo[] {
    return items.map(item => {
      return new LivroVolumeInfo(item)
    })
  }
}
