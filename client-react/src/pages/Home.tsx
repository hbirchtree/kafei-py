import React from 'react';
import Code from '../components/Code';
import UpdateBubble from '../components/UpdateBubble';
import { Yggdrasil } from '../control/Yggdrasil';

interface Props {
    yggdrasil: Yggdrasil;
}

export default function Home(props: Props) {
    const profile = props.yggdrasil.profile;

    return (
        <div data-tab='nav::home' className='ui inverted text tab segment active'>
            <UpdateBubble 
                title={(<p><b>username</b> {profile.username}</p>)}
                content={(<p>All the code is on Github</p>)}
                image={(<img src={profile.img}/>)}
            />

            <h2 className="ui header">Getting started</h2>

            <p>
                Get started by cloning the source code
            </p>

            <Code language="bash">
                git clone https://github.com/hbirchtree/coffeecutie.git
            </Code>

            <p>
                If all your compilers and CMake are in order, you should be able to use the quick-build option as such
            </p>

            <Code language="bash">
                BUILD_MODE=bare ./cb quick-build [ubuntu.amd64, fedora.amd64, osx, ios.x86_64]
            </Code>

            <p>
                Additionally, if you don't want to set up compilers and etc., and you have Docker installed, you can go ahead with
            </p>

            <Code language="bash">
                ./cb quick-build [ubuntu.amd64, fedora.amd64]
            </Code>
        </div>
    );
}