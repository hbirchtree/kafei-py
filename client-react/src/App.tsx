import React, { useEffect, useState } from 'react';
import './styles/global.css';
import NavBar from './components/NavBar';
import { seedTree } from './control/Yggdrasil';
import { BrandIcon } from './components/BrandIcon';
import Icon from './components/Icon';
import Code from './components/Code';
import Home from './pages/Home';
import Examples from './pages/Examples';
import Statistics from './pages/Statistics';
import Diagnostics from './pages/Diagnostics';
import initSemanticTabsDirty from './components/SemanticTab';
import Footer from './components/Footer';

function App() {
  const [yggdrasil, _] = useState(seedTree({
    data: "https://api.birchy.dev",
    profiler: "https://coffee.birchy.dev/",
    crash: "https://crash.birchy.dev/",
    trace: 'https://trace.birchy.dev'
  }, {
    link: "",
    img: ""
  }));

  const [nav, setNav] = useState('nav::home');

  const stylesheets = [
    'semantic/semantic.min.css',
    'semantic/components/container.min.css',
    'semantic/components/grid.min.css',
    'semantic/components/header.min.css',
    'semantic/components/menu.min.css',
    'semantic/components/modal.min.css',
    'semantic/components/tab.min.css',
    'highlight/dracula.css',
  ].map(style => (<link key={style} rel='stylesheet' href={style} />));

  useEffect(() => initSemanticTabsDirty('.ui.menu .item'));

  return (
    <div className="kafei">
      {stylesheets}
      <NavBar
        defaultItem={nav}
        callback={setNav}
        internalLinks={yggdrasil.menu.links}
        externalLinks={yggdrasil.menu.externals}
      />
      <BrandIcon icon='facebook' />
      <Icon icon='box' size={48} foreground='white' />
      <Code language="cpp">
        int main()
          return 0;
      </Code>

      <Home />
      <Examples />
      <Statistics />
      <Diagnostics data={yggdrasil.diagnostics} />

      <Footer source={{
          link: 'https://github.com/hbirchtree/kafei-py'
        }}
      />
    </div>
  );
}

export default App;
