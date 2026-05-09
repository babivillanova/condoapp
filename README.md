# CondoApp — Mapa de Interesses do Condomínio

App web para descobrir interesses em comum entre moradores de um condomínio e
mostrar onde estão os picos de demanda por horário, faixa etária e gênero.

Stack: **Next.js 15 (App Router)** · **TypeScript** · **Tailwind CSS** · **Supabase (Postgres)** · deploy no **Vercel**.

---

## Como funciona

Fluxo do morador (5 passos, ~3 min):

1. **Identificação** — nome completo + unidade. O servidor faz match silencioso contra a lista oficial; se bater, marca como `verified`, senão `pending` (sem expor a lista pro cliente).
2. **Perfil** — faixa etária + gênero.
3. **Interesses** — catálogo amplo (esportes, música, idiomas, jogos, social…), com busca, multi-select e nível de afinidade (Curioso · Praticante · Quero ensinar).
4. **Disponibilidade** — grade 7 dias × 4 turnos (Manhã / Tarde / Noite / Madrugada) com drag-to-select.
5. **Revisão e envio.**

Visões agregadas (`/dashboard`):
- Top interesses (com filtros por idade/gênero)
- Heatmap de disponibilidade (filtrável por interesse)
- Quebra demográfica

Painel admin (`/admin`):
- Login simples (email + senha por env)
- Lista de respostas com status `verified` / `pending` / `rejected`
- CRUD da lista oficial de moradores + import por CSV

---

## Setup local

### 1. Crie o projeto Supabase (free tier)

1. Acesse https://app.supabase.com → **New project**.
2. Anote `Project URL`, `anon key` e `service_role key` (Settings → API).
3. SQL Editor → cole e execute na ordem:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_seed_interests.sql`

### 2. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
cp .env.example .env.local
# gera SESSION_SECRET
openssl rand -hex 32
```

### 3. Rodar

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

### 4. Cadastrar moradores

Entre em http://localhost:3000/admin/login com `ADMIN_EMAIL` / `ADMIN_PASSWORD` definidos no `.env.local`. Vá em **Gerenciar lista** e adicione moradores um a um, ou cole um CSV no formato `Nome, Unidade`.

> A lista oficial nunca trafega ao cliente — o match acontece 100% no servidor (normalização + Levenshtein ≤ 2 + match exato de unidade).

---

## Deploy no Vercel

1. https://vercel.com/new → importe `babivillanova/condoapp`.
2. Em **Environment Variables** adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SESSION_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `NEXT_PUBLIC_CONDO_NAME`
3. Deploy.

Não há build steps especiais — `next build` padrão.

---

## Modelo de dados

```
residents_roster        lista oficial (nome, unidade)  ← nunca exposta ao cliente
profiles                quem respondeu (nome, unidade, idade, gênero, status)
interests               catálogo (categoria, nome, sort_order, active)
profile_interests       N:N profile × interest + afinidade
availability            7 dias × 4 turnos (até 28 linhas por profile)
```

RLS habilitado em todas as tabelas. O catálogo (`interests`) é o único com leitura pública. Tudo o mais passa pela `service_role` (só usada no server).

---

## Privacidade

- O dashboard mostra **apenas agregados**. Nunca expõe nomes ou unidades.
- A lista oficial de moradores nunca é enviada para o cliente.
- Cada morador tem botão "apagar minhas respostas" na tela de revisão.

---

## Roadmap

**v1 (atual)**
- ✅ Fluxo morador completo
- ✅ Dashboard agregado com filtros
- ✅ Admin com verificação + roster CRUD

**v1.1**
- Dependentes (1 adulto cadastra filhos no mesmo perfil pai)
- CRUD do catálogo de interesses na UI de admin
- Export CSV das respostas

**v2**
- Multi-condomínio (multi-tenant)
- Sugestão automática: "Yoga sáb 9h — 12 pessoas, viável formar turma"
- Notificação por email quando uma turma fecha massa crítica

---

## Estrutura

```
src/
  app/
    page.tsx                         landing
    identify/page.tsx                passo 1
    profile/page.tsx                 passo 2
    interests/page.tsx               passo 3
    availability/page.tsx            passo 4
    review/page.tsx                  passo 5 (envio)
    dashboard/page.tsx               agregado público
    admin/
      login/page.tsx
      page.tsx                       lista de respostas
      roster/page.tsx                CRUD da lista oficial
  components/
    progress-bar.tsx
    interest-picker.tsx              client (busca + multi-select + afinidade)
    availability-grid.tsx            client (drag-to-select 7×4)
    heatmap.tsx
    ui/                              button, input, card
  lib/
    supabase.ts                      clients (admin + público)
    session.ts                       cookie HMAC (morador + admin)
    match.ts                         normalize + Levenshtein
    actions.ts                       server actions do morador
    admin-actions.ts                 server actions do admin
    dashboard.ts                     queries agregadas
    types.ts                         enums compartilhados
supabase/
  migrations/
    0001_init.sql                    schema + RLS
    0002_seed_interests.sql          catálogo inicial
```
