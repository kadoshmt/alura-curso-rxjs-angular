# Buscante

Código e resumo do curso da Alura sobre RxJS no Angular.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.0.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

# Sobre RxJS

## O que é RxJS?

O RxJS significa **"Reactive Extensions Library for JavaScript"** (ou **"Biblioteca de Extensões Reativas para Javascript"**).
Trata-se de uma biblioteca para **programação reativa**, para construção de programas assíncronos, ou baseados em eventos. Ela utiliza uma coleção de Observables.

## Observable e Observers

No RxJS temos dois conceitos essenciais:
1. **Observable**, o qual representa a ideia de uma coleção de valores ou eventos futuros;
2. **Observer**, o qual representa a ideia de uma coleção de callbacks. Ele consegue ouvir os valores entregues pelo Observable.

```typescript
 buscar (valorDigitado: string): Observable<any>{
    const params = new HttpParams().append('q', valorDigitado);
    return this.http.get(this.API,  {params})
  }
```

**Por que não conseguimos realizar a ligação e obtenção de respostas entre o Observable e o Observer?** Isso ocorre porque o Observable é lazy, ("preguiçoso"). Isso significa que o **Observer precisa informar que está interessado nas suas informações**. Isso é feito através de uma inscrição (*subscribe*). Por meio do *subscribe()* componentes podem se inscrever para receber notificações quando o evento ocorrer e acessar as mudanças decorrentes dele.

***O padrão observer é a base da programação orientada a eventos.*** Outro nome para esse padrão é **Pub/Sub**, abreviação de publication / subscription ("publicação" / "assinatura").

```typescript
buscarLivros() {
    this.service.buscar(this.campoBusca).subscribe(
        (retornoAPI) => console.log(retornoAPI)
        (error) => console.log(error)
    )
}
```

A forma de utilização do subscribe acima está obsoleta e será removida na próxima versão (v8) do RxJS. Agora é utilizado passando um objeto contendo Next, Error, Complete.

### Next, Error, Complete

Para que o risco atravessando o subscribe() desapareça, informaremos argumentos separados de uma forma diferente, criando um objeto e informando notificações emitidas pelo Observable.

Há 3 tipos de notifificações emitidas pelo ***subscribe()***
1. **"Next"** é tida como a mais importante e a mais comum. É ela que nos trará dados.
2. **"Error"** nos trará erros de diversos tipos — no caso do Angular, o HttpErrorResponse, e encerrará o ciclo de vida do Observable;
3. **"Complete"** não traz dados, mas também encerra o ciclo de vida do Observable.

Temos as seguintes diferenças entre as notificações:
- "Error" e "Complete" são opcionais. É possível informar somente a notificação next. Ambos só podem ser emitidos uma vez, e só pode haver um deles por ciclo de vida;
- a "Next" é a mais importante e pode ser emitida mais de uma vez, ou seja, o Observable pode emitir valores várias vezes durante a sua existência.

### Unsubscribe

Por que precisamos nos desinscrever? Sempre que realizamos um subscribe, temos como boa prática a realização do unsubscribe para liberar recursos e evitar vazamentos de memória.
A Subscription representa a assinatura ou a execução do Observable e possui o unsubscribe como método importante. Ele é utilizado para liberar recursos e cancelar execuções do Observable.
Quando realizamos um subscribe do Observer no Observable, esse processo nos retornará uma assinatura. Ela será do tipo Subscription. Podemos guardar este retorno em um parâmetro.
Agora, podemos adicionar o método ngOnDestroy() {} do ciclo de vida do Angular, que ocorrerá quando este componente for destruído.
Nele, chamamos o método unsubscribe() da subscription. Este método não receberá argumentos, apenas encerrará o Observable.


```typescript
...
subscription: Subscription

constructor(private service: LivroService) { }

buscarLivros(){
    this.subscription = this.service.buscar(this.campoBusca).subscribe({
      next: retornoAPI => console.log(retornoAPI),
      error: error => console.log(error),
      complete: () => console.log('Observable completado'),
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
```

### Tipando o retorno da API

A API do Google Books nos retorna um objeto muito complexo, que possui um totalItems e um arranjo de 10 itens, cada qual corresponde a um cartão que será renderizado.
Nós não precisamos de todas essas informações, portanto aprenderemos a abstrair as informações que não precisamos e a manipular esse fluxo utilizando o RxJS.
Precisamos de um modelo que caracterize esse retorno da API com as informações que precisamos. No Angular, quando precisamos criar um modelo, criamos um arquivo chamado Interface.
Precisaremos criar mais de uma interface, pois o objeto é complexo. Veja o resultado final no arquivo .src/apps/models/interfaces.ts
Agora que definimos o objeto de retorno da API, podemos então substituir o tipo do Observable de <any> para <LivrosResultado>.

```typescript
buscar(valorDigitado: string): Observable<LivrosResultado> {
  const params = new HttpParams().append('q', valorDigitado)
  return this.http.get<LivrosResultado>(this.API, { params })
}
```

### Operadores Pipe, Tap e Map

Agora que tipamos o retorno fo método get(), é indicado usar operadores do RxJS para transformarmos a resposta obtida pela API.
Operadores são funções que conseguem combinar diversos tipos de Observable<>s para obter diferentes tipos de resposta. Veremos três que nos serão úteis.
Utilizaremos o ***pipe()*** primeiramente, que servirá para agrupar diversos outros tipos de operadores, então é como a tradução "cano" em que passará o fluxo de informações para aplicarmos as transformações.
Dentro do Pipe, utilizaremos o ***tap()***,  que por sua vez é como se fosse um "espião", ou seja, é utilizado apenas para debug da aplicação.
Ele pode ser utilizado em qualquer etapa da aplicação, pois não irá modificar o fluxo do ***Observable<>*** anterior.


```typescript
buscar(valorDigitado: string): Observable<LivrosResultado> {
  const params = new HttpParams().append('q', valorDigitado )
  return this.http.get<LivrosResultado>(this.API, { params })
    .pipe(
      tap(retornoAPI => console.log('Fluxo do tap', retornoAPI)),
    )
}

```
Quando queremos aplicar uma transformação do fluxo des dados recebidos da API, poderemos usar o operador ***map()***. O método é semelhante à função map() utilizada para arrays no javascript.
Agora que estamso retornando o objeto do tipo *Items* de denteo de *LivrosResultado*, é preciso mudar o retorno do método buscar(), de *LivrosResultado* para *Items[]* 

```typescript
buscar(valorDigitado: string): Observable<Item[]> {
  const params = new HttpParams().append('q', valorDigitado )
  return this.http.get<LivrosResultado>(this.API, { params })
    .pipe(
      tap(retornoAPI => console.log('Fluxo do tap', retornoAPI)),
      map(resultado => resultado.items),
      tap(resultado => console.log('Fluxo após o map', resultado))
    )
  }

```

Após isso, realizaremos as adequações no componente ***lista-livros.component,ts*** para pegar os dados do retorno do service busca() e enviar ao card de livro.

```typescript
export class ListaLivrosComponent implements OnDestroy {
  listaLivros: Livro[];
  livro: Livro
  ...

  buscarLivros(){
    this.subscription = this.service.buscar(this.campoBusca).subscribe({
      next: (items) => {
        this.listaLivros = this.livrosResultadoParaLivros(items)
      },
      error: error => console.log(error),
      complete: () => console.log('Observable completado'),
    });
  }

  livrosResultadoParaLivros(items): Livro[] {
    const livros: Livro[] = []

    items.forEach(item => {
      livros.push(this.livro = {
        title: item.volumeInfo?.title,
        authors: item.volumeInfo?.authors,
        publisher: item.volumeInfo?.publisher,
        publishedDate: item.volumeInfo?.publishedDate,
        description: item.volumeInfo?.description,
        previewLink: item.volumeInfo?.previewLink,
        thumbnail: item.volumeInfo?.imageLinks?.thumbnail
      })
    })

    return livros
  }
```

E por fim, realizaremos as adequações no componente ***livro.component,ts*** e seu template para apresentar no card os dados do livro.

```typescript
@Component({
  selector: 'app-livro',
  templateUrl: './livro.component.html',
  styleUrls: ['./livro.component.css']
})
export class LivroComponent {

  @Input() livro: Livro;
  modalAberto: boolean;
```

```html
<div class="card">
  <img
    src="{{ livro.thumbnail != undefined ? livro.thumbnail : 'assets/imagens/capa-indisponivel.png'}}"
    alt="Capa do livro">
  <div class="info-card">
    <p class="titulo">{{ livro.title }}</p>
    <p class="informacoes">Autoria:</p>
    <p class="resultado">{{ livro.authors }}</p>
    <p class="informacoes">Data de publicação:</p>
    <p class="resultado">{{ livro.publishedDate }}</p>
    <p class="informacoes">Editora:</p>
    <p class="resultado">{{ livro.publisher }}</p>
    <button (click)="onModalChange(true)">Mais detalhes</button>
  </div>
</div>
<div *ngIf="modalAberto">
  <app-modal-livro [livro]="livro" (mudouModal)="onModalChange($event)"></app-modal-livro>
</div>
```


