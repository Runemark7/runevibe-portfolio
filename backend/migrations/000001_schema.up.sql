CREATE TABLE profile (
    id boolean PRIMARY KEY DEFAULT true CHECK (id),
    name text NOT NULL,
    headline text NOT NULL,
    summary text NOT NULL,
    github_url text NOT NULL,
    linkedin_url text
);

CREATE TABLE projects (
    slug text PRIMARY KEY,
    name text NOT NULL,
    summary text NOT NULL,
    body text NOT NULL,
    kind text NOT NULL CHECK (kind IN ('flagship', 'main', 'standard', 'smaller')),
    visibility text NOT NULL CHECK (visibility IN ('public', 'private')),
    sort_order integer NOT NULL UNIQUE CHECK (sort_order >= 1),
    live_url text,
    repo_url text,
    credit_name text,
    credit_url text,
    credit_license text,
    CONSTRAINT private_has_no_repo CHECK (visibility <> 'private' OR repo_url IS NULL),
    CONSTRAINT credit_complete CHECK (
        (credit_name IS NULL AND credit_url IS NULL AND credit_license IS NULL)
        OR (credit_name IS NOT NULL AND credit_url IS NOT NULL AND credit_license IS NOT NULL)
    )
);

CREATE TABLE project_facts (
    project_slug text NOT NULL REFERENCES projects (slug) ON DELETE CASCADE,
    sort_order integer NOT NULL CHECK (sort_order >= 1),
    label text NOT NULL,
    value text NOT NULL,
    PRIMARY KEY (project_slug, sort_order)
);

CREATE TABLE skills (
    slug text PRIMARY KEY,
    name text NOT NULL,
    summary text NOT NULL,
    category text NOT NULL,
    sort_order integer NOT NULL UNIQUE CHECK (sort_order >= 1)
);

CREATE TABLE skill_usages (
    skill_slug text NOT NULL REFERENCES skills (slug) ON DELETE CASCADE,
    project_slug text NOT NULL REFERENCES projects (slug) ON DELETE CASCADE,
    PRIMARY KEY (skill_slug, project_slug)
);

CREATE TABLE agents (
    slug text PRIMARY KEY,
    name text NOT NULL,
    owns text NOT NULL,
    summary text NOT NULL,
    sort_order integer NOT NULL UNIQUE CHECK (sort_order >= 1)
);

CREATE TABLE workflow_steps (
    slug text PRIMARY KEY,
    name text NOT NULL,
    summary text NOT NULL,
    sort_order integer NOT NULL UNIQUE CHECK (sort_order >= 1)
);

CREATE TABLE infra_notes (
    slug text PRIMARY KEY,
    title text NOT NULL,
    summary text NOT NULL,
    sort_order integer NOT NULL UNIQUE CHECK (sort_order >= 1)
);

CREATE TABLE site_copy (
    key text PRIMARY KEY,
    value text NOT NULL
);
