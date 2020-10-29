import React, { useEffect, useState } from 'react';
import './styles/global.css';
import './styles/Page.scss';
import NavBar from './components/NavBar';
import { seedTree, Yggdrasil } from './control/Yggdrasil';
import Home from './pages/Home';
import Examples from './pages/Examples';
import Diagnostics from './pages/Diagnostics';
import initSemanticTabsDirty, { initSemanticAccordionsDirty } from './components/SemanticTab';
import Footer from './components/Footer';

function App() {
  const [yggdrasil, setYggdrasil] = useState<Yggdrasil>();

  if(!yggdrasil) {
    setYggdrasil(seedTree({
      data: "https://api.birchy.dev",
      profiler: "https://coffee.birchy.dev",
      crash: "https://crash.birchy.dev",
      trace: 'https://trace.birchy.dev'
    }, {
      username: "hbirchtree",
      link: "https://github.com/hbirchtree",
      img: "https://avatars3.githubusercontent.com/u/6828070?s=80&v=4"
    },
    [
      'hbirchtree/coffeecutie',
      'hbirchtree/coffeecutie-imgui',
      'hbirchtree/native-library-bundle',
    ],
    'hbirchtree/coffeecutie'));
  }

  const [nav, setNav] = useState('nav::home');

  const stylesheets = [
    'semantic/semantic.min.css',
    'semantic/components/accordion.min.css',
    'semantic/components/container.min.css',
    'semantic/components/grid.min.css',
    'semantic/components/header.min.css',
    'semantic/components/menu.min.css',
    'semantic/components/modal.min.css',
    'semantic/components/tab.min.css',
    'highlight/dracula.css',
  ].map(style => (<link key={style} rel='stylesheet' href={style} />));

  useEffect(() => initSemanticTabsDirty('.ui.menu .item'));
  useEffect(() => initSemanticAccordionsDirty('.ui.accordion'));

  return (
    <div className="kafei">
      {stylesheets}
      {yggdrasil ? (
        <>
          <NavBar
            defaultItem={nav}
            callback={setNav}
            internalLinks={yggdrasil.menu.links}
            externalLinks={yggdrasil.menu.externals}
            login={yggdrasil.login}
            profile={yggdrasil.profile}
          />
          <Home yggdrasil={yggdrasil} />
          <Examples releases={{
            info: yggdrasil.releases,
            net: yggdrasil.diagnostics}}
          />
          <Diagnostics
            data={yggdrasil.diagnostics}
          />

          <Footer source={{
              link: 'https://github.com/hbirchtree/kafei-py'
            }}
          />
      </>
      ) : (
        <div className="ui active loader" style={{height: '40px'}}></div>
      )}
    </div>
  );
}

export default App;
