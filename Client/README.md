# User Client: Vis for TCMFormulas

## 1. Functions
- [ ] Simple click to start user client
- [ ] Show visualizations about TCM Cases
- [ ] User can upload personal case data
- [ ] visualizations can be updated after user upload data
- [ ] User can download visualizations

## 2. Project Architecture
- [ ] Flask provides back-end
- [ ] Vue provides front-end
- [ ] Packaged as exe

```text
FlaskVueProject/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── routes.py
│   │   ├── templates/
│   │   │   └── index.html
│   │   └── static/
│   │       └── css/
│   │           └── style.css
│   ├── venv/
│   └── app.py
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── router.js
│   │   └── main.js
│   ├── package.json
│   └── webpack.config.js
└── README.md

```

## 3. Quick Start
- packaging:
- click .exe file