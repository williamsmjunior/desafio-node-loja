# Criação de API em NodeJS

## História
Dentro de uma arquitetura de micro serviço precisamos de uma API para cadastro de produtos para uma loja genérica.

### Requisitos funcionais
	- Como gerente gostaria de adicionar um novo produto ao catálogo da loja
	- Como gerente gostaria de editar um produto existente no catálogo
	- Como gerente gostaria de remover o produto do meu catálogo da loja
	- Como gerente gostaria de recuperar uma lista com os produtos disponíveis
	- Como gerente gostaria de buscar produtos
	- Como gerente preciso que os resultados sejam páginados
	- Como gerente quero que apenas pessoas com permissão possam: adicionar, editar remover produtos
	- Como cliente quero visualizar um produto
### Requisitos não funcionais
	- A API deve seguir um padrão rest
	- Implemente ao menos 3 testes unitários
	- Trate os possíveis erros com com os padrões HTTP
	- Persistir dados utilizando um NoSQL database

### Entrega
	- Um repositório Git (BitBucket, GitHub, …)
	- Um ambiente rodando a aplicação (Heroku, Firebase, …)

### Critérios de avaliação
	- Entendimento dos requisitos
	- Afinidade com a ferramenta utilizada
	- Testes unitários
	- Estrutura de arquivos
	- Padrão de escrita do código
	- Utilização de boas práticas

### Pré requisitos
	- docker
	- docker-compose

### Execução local
Executar na raiz do projeto
```
$ docker-compose build
$ docker-compose up
```

### Execução dos testes
Inicie o container do mongodb
Na primeira vez execute:

```
$ cd user-service
$ export MONGO_URImongodb://localhost/userservice"
$ npm run seed
```
Pare o servidor após aparecer o log de usuário criado.

Execute "docker-compose up" para iniciar os servidores.

Para executar os testes do user-service:

```
$ cd user-service
$ npm run test
```

Para executar os testes do product-service:

```
$ cd product-service
$ npm run test
```

### Para gerar documentação jsdoc
Execute o comando dentro do projeto de cada servidor:

```
$ npm run jsdoc
```

Abra o arquivo docs/index.html no browser.
A api REST estará documentada no módulo "controller"
