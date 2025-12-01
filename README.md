# Projeto 2 – Programação Web Fullstack
## Backend + Integração com Frontend (React.js)

-> Este projeto é a continuação do Projeto 1, que era exclusivamente focado no Frontend.  
-> O Projeto 2 adiciona a camada Backend completa, incluindo autenticação, busca, inserção, validação e segurança.

---

## Descrição Geral

A aplicação consiste em um sistema de busca e cadastro de alimentos, exibindo:

- Nome  
- Calorias  
- Carboidratos  
- Proteínas  
- Gorduras  

A busca utiliza:
- Banco de dados MongoDB  
- API externa OpenFoodFacts  
- Cache interno  
- Fallback em caso de falha da API externa  

Usuários podem registrar, logar e cadastrar alimentos manualmente.

---

## Tecnologias Utilizadas

### Frontend (mantido do Projeto 1)
-> React.js  
-> Vite.js  
-> Material UI  
-> Context API  
-> Fetch API (AJAX)

### Backend (novo no Projeto 2)
-> Node.js  
-> Express.js  
-> MongoDB + Mongoose  
-> bcrypt.js (criptografia de senhas)  
-> jsonwebtoken (JWT)  
-> express-sanitize-html (sanitização contra XSS/Injection)  
-> node-fetch (requisições à API externa)  
-> dotenv (variáveis de ambiente)

---

## Funcionalidades Implementadas
-> Inserção de Alimentos
### Autenticação (Login e Registro)
- Registro de usuário com senha criptografada (bcrypt)
- Login retornando JWT
- Middleware `authMiddleware` protegendo rotas
- Tokens verificados a cada requisição

### Busca de Alimentos
- Pela API e BD

### Segurança Implementada
-> Criptografia
-> Prevenção de Injeção (SQL/NoSQL/XSS)
-> Autenticação e Identificação
-> Registro e Logs

---

## Prévia
### Página Principal
<img width="1873" height="925" alt="image" src="https://github.com/user-attachments/assets/13a78718-1225-4cb1-b2a3-6448e6d029aa" />

---
### Login e Registro
<img width="1876" height="930" alt="image" src="https://github.com/user-attachments/assets/71330f33-a182-41c7-893e-04248e5f0f40" />

---
<img width="1874" height="928" alt="image" src="https://github.com/user-attachments/assets/53dcb9b1-d380-4bed-b083-2e3fb4b44497" />

---
### Inserção de novos alimentos
<img width="1876" height="925" alt="image" src="https://github.com/user-attachments/assets/ef2a7e22-73ac-41b5-a83c-781ec7f49bc8" />

---
### Banco de dados

<img width="1402" height="824" alt="image" src="https://github.com/user-attachments/assets/6a964ce1-a654-46eb-8b65-94f1302cc3c0" />

---
<img width="1097" height="725" alt="image" src="https://github.com/user-attachments/assets/afdc547a-31eb-46b0-91d6-6a6e37ee549c" />

---
<img width="1092" height="728" alt="image" src="https://github.com/user-attachments/assets/783d6880-5e9f-4ba5-8271-7b8d54a628e2" />

---








