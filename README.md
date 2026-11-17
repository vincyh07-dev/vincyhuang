# Vincy Huang portfolio - editing guide

This is a static HTML, CSS, and JavaScript portfolio. You can open any file directly in VS
Code; there is no build step.

The source is formatted with Prettier. If you use the Prettier VS Code extension, the
included `.prettierrc.json` keeps future edits consistent.

## Where to edit

| What you want to change                                          | File                                           |
| ---------------------------------------------------------------- | ---------------------------------------------- |
| Homepage layout and visible default text                         | `index.html`                                   |
| Lens content, experience cards, links, and project-book chapters | `assets/js/reference.js`                       |
| Homepage colors, spacing, cards, and responsive layout           | `assets/css/reference.css`                     |
| Full case-study styling and interactions                         | `assets/css/style.css` and `assets/js/site.js` |
| CTRL Robotics case study                                         | `projects/ctrl-robotics.html`                  |
| Berkeley CTL case study                                          | `projects/ctl-llm-research.html`               |
| UCSF Radiology case study                                        | `projects/ucsf-radiology.html`                 |
| Streamind Health case study                                      | `projects/streamind-health.html`               |
| Jarvis case study                                                | `projects/jarvis.html`                         |
| Acne project case study                                          | `projects/acne-detection.html`                 |
| Computational Biology case study                                 | `projects/compbio-berkeley.html`               |
| Downloadable résumé                                              | `assets/docs/Vincy_Huang_Resume.pdf`           |
| Images and illustrations                                         | `assets/img/`                                  |

## Fastest way to find content

In VS Code, press `Command + Shift + F` and search for the exact visible phrase or project
name. The main content blocks inside `assets/js/reference.js` are labeled with `EDIT HERE`
comments.

## File organization

```text
vincyhuang/
├── index.html                 # Main one-page portfolio
├── experience.html            # All-experience listing
├── projects.html              # All-project listing
├── about.html / contact.html
├── projects/                  # One full page per case study
└── assets/
    ├── css/                   # Visual styling
    ├── js/                    # Interactions and homepage content
    ├── img/                   # Screenshots and illustrations
    └── docs/                  # Résumé PDF
```

## Preview locally

From this folder, run:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Important editing notes

- Keep project image paths relative to the page. Homepage paths begin with `assets/`;
  pages inside `projects/` begin with `../assets/`.
- Update both the homepage summary and the matching file in `projects/` when changing a
  project.
- External links should use `target="_blank"` and `rel="noopener"`.
- The maroon intro and page-transition animation live in `assets/js/reference.js` and
  `assets/js/site.js`.
