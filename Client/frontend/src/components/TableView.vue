<script setup>
// TODO: 表格内容从后端访问获取

</script>

<template>
    <div id="HerbTable" class="table-container table-responsive w-25">
        <table class="table table-hover w-100 table-light">
            <thead>
                <tr>
                    <th>name</th>
                    <th>性味归经</th>
                    <th>功效</th>
                    <th>主治</th>
                    <th>class</th>
                    <th>名医对于药物的用法</th>
                    <th>classExp</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td data-th="name">茜草</td>
                    <td data-th="性味归经">苦、寒。归肝经。</td>
                    <td data-th="功效">凉血、祛瘀、止血、通经</td>
                    <td data-th="主治">用于吐血、衄血、崩漏、外伤出血、瘀阻经闭、关节痹痛、跌扑肿痛</td>
                    <td data-th="class">止血药</td>
                    <td data-th="名医对于药物的用法">清热止血、治血尿</td>
                    <td data-th="classExp">凉血止血类</td>
                </tr>
                <tr>
                    <td data-th="name">仙鹤草</td>
                    <td data-th="性味归经">苦、涩、平。归心、肝经。</td>
                    <td data-th="功效">收敛止血、截疟、止痢、解毒、补虚</td>
                    <td data-th="主治">用于咯血、吐血、崩漏下血、疟疾、血痢、痈肿疮毒、阴痒带下、脱力劳伤</td>
                    <td data-th="class">止血药</td>
                    <td data-th="名医对于药物的用法">止血、治血尿</td>
                    <td data-th="classExp">凉血止血类</td>
                </tr>
                <tr>
                    <td data-th="name">小蓟</td>
                    <td data-th="性味归经">甘、苦、凉。归心、肝经。</td>
                    <td data-th="功效">凉血止血、散瘀解毒消痈</td>
                    <td data-th="主治">用于衄血、吐血、尿血、血淋、便血、崩漏、外伤出血、痈肿疮毒</td>
                    <td data-th="class">止血药</td>
                    <td data-th="名医对于药物的用法">清热止血、治血尿</td>
                    <td data-th="classExp">凉血止血类</td>
                </tr>
                <tr>
                    <td data-th="name">合欢皮</td>
                    <td data-th="性味归经">甘、平。归心、肝、肺经。</td>
                    <td data-th="功效">解郁安神、活血消肿</td>
                    <td data-th="主治">用于心神不安、忧郁失眠、肺痈、疮肿、跌扑伤痛</td>
                    <td data-th="class">养心安神药</td>
                    <td data-th="名医对于药物的用法">疏肝、安神</td>
                    <td data-th="classExp">安神类</td>
                </tr>
                <tr>
                    <td data-th="name">酸枣仁</td>
                    <td data-th="性味归经">甘、酸、平。归肝、胆、心经。</td>
                    <td data-th="功效">养心补肝、宁心安神、敛汗、生津</td>
                    <td data-th="主治">用于虚烦不眠、惊悸多梦、体虚多汗、津伤口渴</td>
                    <td data-th="class">养心安神药</td>
                    <td data-th="名医对于药物的用法">安神敛阴</td>
                    <td data-th="classExp">安神类</td>
                </tr>
                <tr>
                    <td data-th="name">大黄</td>
                    <td data-th="性味归经">苦、寒。归脾、胃、大肠、肝、心包经。</td>
                    <td data-th="功效">泻下攻积、清热泻火、凉血解毒、逐瘀通经、利湿退黄</td>
                    <td data-th="主治">用于实热积滞便秘、血热吐衄、目赤咽肿、痈肿疔疮、肠痈腹痛、瘀血经闭、产后瘀阻、跌打损伤、湿热痢疾、黄疸尿赤、淋证、水肿；外治烧烫伤</td>
                    <td data-th="class">泻下药</td>
                    <td data-th="名医对于药物的用法">泄浊毒、活血、通腑气、降肌酐</td>
                    <td data-th="classExp">泄浊毒类</td>
                </tr>
                <tr>
                    <td data-th="name">积雪草</td>
                    <td data-th="性味归经">苦、辛、寒。归肝、脾、肾经。</td>
                    <td data-th="功效">清热利湿、解毒消肿</td>
                    <td data-th="主治">用于湿热黄疸、中暑腹泻、石淋血淋、痈肿疮毒、跌扑损伤</td>
                    <td data-th="class">清热类（清热解毒/清热利湿/清热凉血/清热通淋/清热燥湿/清热泻火）</td>
                    <td data-th="名医对于药物的用法">清热泄浊毒</td>
                    <td data-th="classExp">泄浊毒类</td>
                </tr>
                <tr>
                    <td data-th="name">三七</td>
                    <td data-th="性味归经">甘、微苦、温。归肝、胃经。</td>
                    <td data-th="功效">散瘀止血、消肿定痛</td>
                    <td data-th="主治">用于咯血、吐血、衄血、便血、崩漏、外伤出血、胸腹刺痛、跌扑肿痛</td>
                    <td data-th="class">止血药</td>
                    <td data-th="名医对于药物的用法">活血、止血、降蛋白尿、抗肾脏纤维化</td>
                    <td data-th="classExp">活血类</td>
                </tr>
                <tr>
                    <td data-th="name">丹参</td>
                    <td data-th="性味归经">苦、微寒。归心、肝经。</td>
                    <td data-th="功效">活血祛瘀、通经止痛、清心除烦、凉血消痈</td>
                    <td data-th="主治">用于胸痹心痛、脘腹胁痛、癥瘕积聚、热痹疼痛、心烦不眠、月经不调、痛经经闭、疮疡肿痛</td>
                    <td data-th="class">活血祛瘀药</td>
                    <td data-th="名医对于药物的用法">养血活血、化瘀</td>
                    <td data-th="classExp">活血类</td>
                </tr>
                <tr>
                    <td data-th="name">桃仁</td>
                    <td data-th="性味归经">苦、甘、平。归心、肝、大肠经。</td>
                    <td data-th="功效">活血祛瘀、润肠通便、止咳平喘</td>
                    <td data-th="主治">用于经闭痛经、癥瘕痞块、肺痈肠痈、跌扑损伤、肠燥便秘、咳嗽气喘</td>
                    <td data-th="class">活血祛瘀药</td>
                    <td data-th="名医对于药物的用法">活血化瘀、润肠、泄浊毒</td>
                    <td data-th="classExp">活血类</td>
                </tr>
                <tr>
                    <td data-th="name">延胡索</td>
                    <td data-th="性味归经">辛、苦、温。归肝、脾经。</td>
                    <td data-th="功效">活血、行气、止痛</td>
                    <td data-th="主治">用于胸胁、脘腹疼痛、胸痹心痛、经闭痛经、产后瘀阻、跌扑肿痛</td>
                    <td data-th="class">活血祛瘀药</td>
                    <td data-th="名医对于药物的用法">理气止痛</td>
                    <td data-th="classExp">活血类</td>
                </tr>
                <tr>
                    <td data-th="name">泽兰</td>
                    <td data-th="性味归经">苦、辛、微温。归肝、脾经。</td>
                    <td data-th="功效">活血调经、祛瘀消痈、利水消肿</td>
                    <td data-th="主治">用于月经不调、经闭、痛经、产后瘀血腹痛、疮痈肿毒、水肿腹水</td>
                    <td data-th="class">活血祛瘀药</td>
                    <td data-th="名医对于药物的用法">利水活血</td>
                    <td data-th="classExp">活血类</td>
                </tr>
                <tr>
                    <td data-th="name">赤芍</td>
                    <td data-th="性味归经">苦、微寒。归肝经。</td>
                    <td data-th="功效">清热凉血、散瘀止痛</td>
                    <td data-th="主治">用于热入营血、温毒发斑、吐血衄血、目赤肿痛、肝郁胁痛、经闭痛经、癥瘕腹痛、跌扑损伤、痈肿疮疡</td>
                    <td data-th="class">清热类（清热解毒/清热利湿/清热凉血/清热通淋/清热燥湿/清热泻火）</td>
                    <td data-th="名医对于药物的用法">凉血活血</td>
                    <td data-th="classExp">活血类</td>
                </tr>
                <tr>
                    <td data-th="name">白芍</td>
                    <td data-th="性味归经">苦、酸、微寒。归肝、脾经。</td>
                    <td data-th="功效">养血调经、敛阴止汗、柔肝止痛、平抑肝阳</td>
                    <td data-th="主治">用于血虚萎黄、月经不调、自汗、盗汗、胁痛、腹痛、四肢挛痛、头痛眩晕</td>
                    <td data-th="class">补虚药（补气/养血/助阳/滋阴/祛风湿）</td>
                    <td data-th="名医对于药物的用法">养阴、缓急止痛、通便、降血压</td>
                    <td data-th="classExp">活血类</td>
                </tr>
                <tr>
                    <td data-th="name">当归</td>
                    <td data-th="性味归经">甘、辛、温。归肝、心、脾经。</td>
                    <td data-th="功效">补血活血、调经止痛、润肠通便</td>
                    <td data-th="主治">用于血虚萎黄、眩晕心悸、月经不调、经闭痛经、虚寒腹痛、风湿痹痛、跌扑损伤、痈疽疮疡、肠燥便秘</td>
                    <td data-th="class">补虚药（补气/养血/助阳/滋阴/祛风湿）</td>
                    <td data-th="名医对于药物的用法">活血补血</td>
                    <td data-th="classExp">活血类</td>
                </tr>
                <tr>
                    <td data-th="name">白花蛇舌草</td>
                    <td data-th="性味归经">甘、淡、凉。入胃、大肠、小肠经。</td>
                    <td data-th="功效">清热、利湿、解毒、抗癌</td>
                    <td data-th="主治"></td>
                    <td data-th="class">清热类（清热解毒/清热利湿/清热凉血/清热通淋/清热燥湿/清热泻火）</td>
                    <td data-th="名医对于药物的用法">清热解毒、降蛋白尿</td>
                    <td data-th="classExp">清热类（利湿/解毒）</td>
                </tr>
                <tr>
                    <td data-th="name">金银花</td>
                    <td data-th="性味归经">甘、寒。归肺、心、胃经。</td>
                    <td data-th="功效">清热解毒、疏散风热</td>
                    <td data-th="主治">用于痈肿疔疮、喉痹、丹毒、热毒血痢、风热感冒、温病发热</td>
                    <td data-th="class">清热类（清热解毒/清热利湿/清热凉血/清热通淋/清热燥湿/清热泻火）</td>
                    <td data-th="名医对于药物的用法">清热解毒、利咽</td>
                    <td data-th="classExp">清热类（利湿/解毒）</td>
                </tr>
                <tr>
                    <td data-th="name">蒲公英</td>
                    <td data-th="性味归经">苦、甘、寒。归肝、胃经。</td>
                    <td data-th="功效">清热解毒、消肿散结、利尿通淋</td>
                    <td data-th="主治">用于疔疮肿毒、乳痈、瘰疬、目赤、咽痛、肺痈、肠痈、湿热黄疸、热淋涩痛</td>
                    <td data-th="class">清热类（清热解毒/清热利湿/清热凉血/清热通淋/清热燥湿/清热泻火）</td>
                    <td data-th="名医对于药物的用法">清热解毒、降蛋白尿、利咽止咳、中药抗感染作用（胃肠道、泌尿道）</td>
                    <td data-th="classExp">清热类（利湿/解毒）</td>
                </tr>
                <tr>
                    <td data-th="name">土茯苓</td>
                    <td data-th="性味归经">甘、淡、平。归肝、胃经。</td>
                    <td data-th="功效">解毒、除湿、通利关节</td>
                    <td data-th="主治">用于梅毒及汞中毒所致的肢体拘挛、筋骨疼痛；湿热淋浊、带下、痈肿、瘰疬、疥癣</td>
                    <td data-th="class">清热类（清热解毒/清热利湿/清热凉血/清热通淋/清热燥湿/清热泻火）</td>
                    <td data-th="名医对于药物的用法">清热利湿、消肿止痛、解毒、降尿酸</td>
                    <td data-th="classExp">清热类（利湿/解毒）</td>
                </tr>
                <tr>
                    <td data-th="name">鱼腥草</td>
                    <td data-th="性味归经">辛、微寒。归肺经。</td>
                    <td data-th="功效">清热解毒、消痈排脓、利尿通淋</td>
                    <td data-th="主治">用于肺痈吐脓、痰热喘咳、热痢、热淋、痈肿疮毒</td>
                    <td data-th="class">清热类（清热解毒/清热利湿/清热凉血/清热通淋/清热燥湿/清热泻火）</td>
                    <td data-th="名医对于药物的用法">清热解毒、化热痰</td>
                    <td data-th="classExp">清热类（利湿/解毒）</td>
                </tr>
                <tr>
                    <td data-th="name">白茅根</td>
                    <td data-th="性味归经">甘、寒。归肺、胃、膀胱经。</td>
                    <td data-th="功效">凉血止血、清热利尿</td>
                    <td data-th="主治">用于血热吐血、衄血、尿血、热病烦渴、湿热黄疸、水肿尿少、热淋涩痛</td>
                    <td data-th="class">清热类（清热解毒/清热利湿/清热凉血/清热通淋/清热燥湿/清热泻火）</td>
                    <td data-th="名医对于药物的用法">清热通淋、治血尿</td>
                    <td data-th="classExp">清热类（利湿/解毒）</td>
                </tr>
                <tr>
                    <td data-th="name">板蓝根</td>
                    <td data-th="性味归经">苦、寒。归心、胃经。</td>
                    <td data-th="功效">清热解毒、凉血利咽</td>
                    <td data-th="主治">用于温疫时毒、发热咽痛、温毒发斑、痄腮、烂喉丹痧、大头瘟疫、丹毒、痈肿</td>
                    <td data-th="class">清热类（清热解毒/清热利湿/清热凉血/清热通淋/清热燥湿/清热泻火）</td>
                    <td data-th="名医对于药物的用法">清热解毒、利咽</td>
                    <td data-th="classExp">清热类（利湿/解毒）</td>
                </tr>
                <tr>
                    <td data-th="name">石韦</td>
                    <td data-th="性味归经">甘、苦、微寒。归肺、膀胱经。</td>
                    <td data-th="功效">利尿通淋、清肺止咳、凉血止血</td>
                    <td data-th="主治">用于热淋、血淋、石淋、小便不通、淋沥涩痛、肺热喘咳、吐血、衄血、尿血、崩漏</td>
                    <td data-th="class">清热类（清热解毒/清热利湿/清热凉血/清热通淋/清热燥湿/清热泻火）</td>
                    <td data-th="名医对于药物的用法">清热利湿、降蛋白尿</td>
                    <td data-th="classExp">清热类（利湿/解毒）</td>
                </tr>
                <tr>
                    <td data-th="name">知母</td>
                    <td data-th="性味归经">苦、甘、寒。归肺、胃、肾经。</td>
                    <td data-th="功效">清热泻火、滋阴润燥</td>
                    <td data-th="主治">用于外感热病、高热烦渴、肺热燥咳、骨蒸潮热、内热消渴、肠燥便秘</td>
                    <td data-th="class">清热类（清热解毒/清热利湿/清热凉血/清热通淋/清热燥湿/清热泻火）</td>
                    <td data-th="名医对于药物的用法">清热、除烦止渴</td>
                    <td data-th="classExp">清热类（利湿/解毒）</td>
                </tr>
                <tr>
                    <td data-th="name">黄芩</td>
                    <td data-th="性味归经">苦、寒。归肺、胆、脾、大肠、小肠经。</td>
                    <td data-th="功效">清热燥湿、泻火解毒、止血、安胎</td>
                    <td data-th="主治">用于湿温、暑湿、胸闷呕恶、湿热痞满、泻痢、黄疸、肺热咳嗽、高热烦渴、血热吐衄、痈肿疮毒、胎动不安</td>
                    <td data-th="class">清热类（清热解毒/清热利湿/清热凉血/清热通淋/清热燥湿/清热泻火）</td>
                    <td data-th="名医对于药物的用法">清热燥湿、清上焦之热、中药抗感染（呼吸道）</td>
                    <td data-th="classExp">清热类（利湿/解毒）</td>
                </tr>
                <tr>
                    <td data-th="name">薏苡仁</td>
                    <td data-th="性味归经">甘、淡、凉。归脾、胃、肺经。</td>
                    <td data-th="功效">利水渗湿、健脾止泻、除痹、排脓、解毒散结</td>
                    <td data-th="主治">用于水肿、脚气、小便不利、脾虚泄泻、湿痹拘挛、肺痈、肠痈、赘疣、癌肿</td>
                    <td data-th="class">祛湿类（化湿/利水渗湿）</td>
                    <td data-th="名医对于药物的用法">健脾利水、消水肿、生薏苡仁偏利水祛湿、炒薏苡仁偏健脾利水</td>
                    <td data-th="classExp">清热类（利湿/解毒）</td>
                </tr>
                <tr>
                    <td data-th="name">车前子</td>
                    <td data-th="性味归经">甘、寒。归肝、肾、肺、小肠经。</td>
                    <td data-th="功效">清热利尿通淋、渗湿止泻、明目、祛痰</td>
                    <td data-th="主治">用于热淋涩痛、水肿胀满、暑湿泄泻、目赤肿痛、痰热咳嗽</td>
                    <td data-th="class">祛湿类（化湿/利水渗湿）</td>
                    <td data-th="名医对于药物的用法">清热通淋</td>
                    <td data-th="classExp">清热类（利湿/解毒）</td>
                </tr>
                <tr>
                    <td data-th="name">菊花</td>
                    <td data-th="性味归经">甘、苦、微寒。归肺、肝经。</td>
                    <td data-th="功效">散风清热、平肝明目、清热解毒</td>
                    <td data-th="主治">用于风热感冒、头痛眩晕、目赤肿痛、眼目昏花、疮痈肿毒</td>
                    <td data-th="class">解表药</td>
                    <td data-th="名医对于药物的用法">解毒利咽、祛风解表</td>
                    <td data-th="classExp">清热类（利湿/解毒）</td>
                </tr>
                <tr>
                    <td data-th="name">地肤子</td>
                    <td data-th="性味归经">辛、苦、寒。归肾、膀胱经。</td>
                    <td data-th="功效">清热利湿、祛风止痒</td>
                    <td data-th="主治">用于小便涩痛、阴痒带下、风疹、湿疹、皮肤瘙痒</td>
                    <td data-th="class">清热类（清热解毒/清热利湿/清热凉血/清热通淋/清热燥湿/清热泻火）</td>
                    <td data-th="名医对于药物的用法">清热解表、祛风止痒</td>
                    <td data-th="classExp">祛风止痒类</td>
                </tr>
                <tr>
                    <td data-th="name">白鲜皮</td>
                    <td data-th="性味归经">苦、寒。归脾、胃、膀胱经。</td>
                    <td data-th="功效">清热燥湿、祛风解毒</td>
                    <td data-th="主治">用于湿热疮毒、黄水淋漓、湿疹、风疹、疥癣疮癞、风湿热痹、黄疸尿赤</td>
                    <td data-th="class">清热类（清热解毒/清热利湿/清热凉血/清热通淋/清热燥湿/清热泻火）</td>
                    <td data-th="名医对于药物的用法">清湿热、祛风止痒、</td>
                    <td data-th="classExp">祛风止痒类</td>
                </tr>
                <tr>
                    <td data-th="name">山茱萸</td>
                    <td data-th="性味归经">酸、涩、微温。归肝、肾经。</td>
                    <td data-th="功效">补益肝肾、收涩固脱</td>
                    <td data-th="主治">用于眩晕耳鸣、腰膝酸痛、阳痿遗精、遗尿尿频、崩漏带下、大汗虚脱、内热消渴</td>
                    <td data-th="class">收敛药</td>
                    <td data-th="名医对于药物的用法">补肾填精、性温</td>
                    <td data-th="classExp">补肾类（降蛋白尿）</td>
                </tr>
                <tr>
                    <td data-th="name">牛膝</td>
                    <td data-th="性味归经">苦、甘、酸、平。归肝、肾经。</td>
                    <td data-th="功效">瘀通经、补肝肾、强筋骨、利尿通淋、引血下行</td>
                    <td data-th="主治">用于经闭、痛经、腰膝酸痛、筋骨无力、淋证、水肿、头痛、眩晕、牙痛、口疮、吐血、衄血</td>
                    <td data-th="class">活血祛瘀药</td>
                    <td data-th="名医对于药物的用法">补肾填精、壮骨</td>
                    <td data-th="classExp">补肾类（降蛋白尿）</td>
                </tr>
                <tr>
                    <td data-th="name">生地黄</td>
                    <td data-th="性味归经">甘、寒。归心、肝、肾经。</td>
                    <td data-th="功效">清热凉血、养阴生津</td>
                    <td data-th="主治">用于热入营血、温毒发斑、吐血衄血、热病伤阴、舌绛烦渴、津伤便秘、阴虚发热、骨蒸劳热、内热消渴</td>
                    <td data-th="class">清热类（清热解毒/清热利湿/清热凉血/清热通淋/清热燥湿/清热泻火）</td>
                    <td data-th="名医对于药物的用法">补肾填精、清热养阴润燥</td>
                    <td data-th="classExp">补肾类（降蛋白尿）</td>
                </tr>
                <tr>
                    <td data-th="name">黄精</td>
                    <td data-th="性味归经">甘、平。归脾、肺、肾经。</td>
                    <td data-th="功效">补气养阴、健脾、润肺、益肾</td>
                    <td data-th="主治">用于脾胃气虚、体倦乏力、胃阴不足、口干食少、肺虚燥咳、劳嗽咳血、精血不足、腰膝酸软、须发早白、内热消渴</td>
                    <td data-th="class">补虚药（补气/养血/助阳/滋阴/祛风湿）</td>
                    <td data-th="名医对于药物的用法">补肾填精、滋肾阴、降蛋白尿</td>
                    <td data-th="classExp">补肾类（降蛋白尿）</td>
                </tr>
                <tr>
                    <td data-th="name">山药</td>
                    <td data-th="性味归经">甘、平。归脾、肺、肾经。</td>
                    <td data-th="功效">补脾养胃、生津益肺、补肾涩精</td>
                    <td data-th="主治">用于脾虚食少、久泻不止、肺虚喘咳、肾虚遗精、带下、尿频、虚热消渴</td>
                    <td data-th="class">补虚药（补气/养血/助阳/滋阴/祛风湿）</td>
                    <td data-th="名医对于药物的用法">健脾益气、降蛋白尿</td>
                    <td data-th="classExp">补肾类（降蛋白尿）</td>
                </tr>
                <tr>
                    <td data-th="name">熟地黄</td>
                    <td data-th="性味归经">甘、微温。归肝、肾经。</td>
                    <td data-th="功效">补血滋阴、益精填髓</td>
                    <td data-th="主治">用于血虚萎黄、心悸怔忡、月经不调、崩漏下血、肝肾阴虚、腰膝酸软、骨蒸潮热、盗汗遗精、内热消渴、眩晕、耳鸣、须发早白</td>
                    <td data-th="class">补虚药（补气/养血/助阳/滋阴/祛风湿）</td>
                    <td data-th="名医对于药物的用法">补肾填精、滋阴润燥</td>
                    <td data-th="classExp">补肾类（降蛋白尿）</td>
                </tr>
                <tr>
                    <td data-th="name">制何首乌</td>
                    <td data-th="性味归经">苦、甘、涩、微温。归肝、心、肾经。</td>
                    <td data-th="功效">补肝肾、益精血、乌须发、强筋骨、化浊降脂</td>
                    <td data-th="主治">用于血虚萎黄、眩晕耳鸣、须发早白、腰膝酸软、肢体麻木、崩漏带下、高脂血症</td>
                    <td data-th="class">补虚药（补气/养血/助阳/滋阴/祛风湿）</td>
                    <td data-th="名医对于药物的用法">益肝肾、降蛋白尿</td>
                    <td data-th="classExp">补肾类（降蛋白尿）</td>
                </tr>
                <tr>
                    <td data-th="name">菟丝子</td>
                    <td data-th="性味归经">辛、甘、平。归肝、肾、脾经。</td>
                    <td data-th="功效">补益肝肾、固精缩尿、安胎、明目、止泻；外用消风祛斑</td>
                    <td data-th="主治">用于肝肾不足、腰膝酸软、阳痿遗精、遗尿尿频、肾虚胎漏、胎动不安、目昏耳鸣、脾肾虚泻：外治白癜风</td>
                    <td data-th="class">补虚药（补气/养血/助阳/滋阴/祛风湿）</td>
                    <td data-th="名医对于药物的用法">补肾、降蛋白尿</td>
                    <td data-th="classExp">补肾类（降蛋白尿）</td>
                </tr>
                <tr>
                    <td data-th="name">淫羊藿</td>
                    <td data-th="性味归经">辛、甘、温。归肝、肾经。</td>
                    <td data-th="功效">补肾阳、强筋骨、祛风湿</td>
                    <td data-th="主治">用于肾阳虚衰、阳痿遗精、筋骨痿软、风湿痹痛、麻木拘挛</td>
                    <td data-th="class">补虚药（补气/养血/助阳/滋阴/祛风湿）</td>
                    <td data-th="名医对于药物的用法">温阳补肾</td>
                    <td data-th="classExp">补肾类（降蛋白尿）</td>
                </tr>
                <tr>
                    <td data-th="name">墨旱莲</td>
                    <td data-th="性味归经">甘、酸、寒。归肾、肝经。</td>
                    <td data-th="功效">滋补肝肾、凉血止血</td>
                    <td data-th="主治">用于肝肾阴虚、牙齿松动、须发早白、眩晕耳鸣、腰膝酸软、阴虚血热吐血、衄血、尿血、血痢、崩漏下血、外伤出血</td>
                    <td data-th="class">补虚药（补气/养血/助阳/滋阴/祛风湿）</td>
                    <td data-th="名医对于药物的用法">滋阴补肾、与女贞子合方为二至丸。</td>
                    <td data-th="classExp">补肾类（降蛋白尿）</td>
                </tr>
                <tr>
                    <td data-th="name">女贞子</td>
                    <td data-th="性味归经">甘、苦、凉。归肝、肾经。</td>
                    <td data-th="功效">滋补肝肾、明目乌发</td>
                    <td data-th="主治">用于肝肾阴虚、眩晕耳鸣、腰膝酸软、须发早白、目暗不明、内热消渴、骨蒸潮热</td>
                    <td data-th="class">补虚药（补气/养血/助阳/滋阴/祛风湿）</td>
                    <td data-th="名医对于药物的用法">滋阴补肾、润肠、与墨旱莲合方为二至丸</td>
                    <td data-th="classExp">补肾类（降蛋白尿）</td>
                </tr>
                <tr>
                    <td data-th="name">桑寄生</td>
                    <td data-th="性味归经">苦、甘、平。归肝、肾经。</td>
                    <td data-th="功效">祛风湿、补肝肾、强筋骨、安胎元</td>
                    <td data-th="主治">用于风湿痹痛、腰膝酸软、筋骨无力、崩漏经多、妊娠漏血、胎动不安、头晕目眩</td>
                    <td data-th="class">补虚药（补气/养血/助阳/滋阴/祛风湿）</td>
                    <td data-th="名医对于药物的用法">补肾气、祛风湿、强脊骨</td>
                    <td data-th="classExp">补肾类（降蛋白尿）</td>
                </tr>
                <tr>
                    <td data-th="name">麦芽</td>
                    <td data-th="性味归经">甘、平。归脾、胃经。</td>
                    <td data-th="功效">行气消食、健脾开胃、回乳消胀</td>
                    <td data-th="主治">用于食积不消、脘腹胀痛、脾虚食少、乳汁郁积、乳房胀痛、妇女断乳、肝郁胁痛、肝胃气痛</td>
                    <td data-th="class">消食药</td>
                    <td data-th="名医对于药物的用法">健脾消食、开胃</td>
                    <td data-th="classExp">补脾益气类</td>
                </tr>
                <tr>
                    <td data-th="name">陈皮</td>
                    <td data-th="性味归经">苦、辛、温。归肺、脾经。</td>
                    <td data-th="功效">理气健脾、燥湿化痰</td>
                    <td data-th="主治">用于脘腹胀满、食少吐泻、咳嗽痰多</td>
                    <td data-th="class">理气药</td>
                    <td data-th="名医对于药物的用法">健脾理气</td>
                    <td data-th="classExp">补脾益气类</td>
                </tr>
                <tr>
                    <td data-th="name">砂仁</td>
                    <td data-th="性味归经">辛、温。归脾、胃、肾经。</td>
                    <td data-th="功效">化湿开胃、温脾止泻、理气安胎</td>
                    <td data-th="主治">用于湿浊中阻、脘痞不饥、脾胃虚寒、呕吐泄泻、妊娠恶阻、胎动不安</td>
                    <td data-th="class">祛湿类（化湿/利水渗湿）</td>
                    <td data-th="名医对于药物的用法">醒脾和胃、燥湿</td>
                    <td data-th="classExp">补脾益气类</td>
                </tr>
                <tr>
                    <td data-th="name">茯苓</td>
                    <td data-th="性味归经">甘、淡、平。归心、肺、脾、肾经。</td>
                    <td data-th="功效">利水渗湿、健脾、宁心</td>
                    <td data-th="主治">用于水肿尿少、痰饮眩悸、脾虚食少、便溏泄泻、心神不安、惊悸失眠</td>
                    <td data-th="class">祛湿类（化湿/利水渗湿）</td>
                    <td data-th="名医对于药物的用法">淡渗利湿、茯神偏利湿安神、茯苓皮偏利水祛湿</td>
                    <td data-th="classExp">补脾益气类</td>
                </tr>
                <tr>
                    <td data-th="name">白术</td>
                    <td data-th="性味归经">苦、甘、温。归脾、胃经。</td>
                    <td data-th="功效">健脾益气、燥湿利水、止汗、安胎</td>
                    <td data-th="主治">用于脾虚食少、腹胀泄泻、痰饮眩悸、水肿、自汗、胎动不安</td>
                    <td data-th="class">补虚药（补气/养血/助阳/滋阴/祛风湿）</td>
                    <td data-th="名医对于药物的用法">健脾益气、燥湿</td>
                    <td data-th="classExp">补脾益气类</td>
                </tr>
                <tr>
                    <td data-th="name">党参</td>
                    <td data-th="性味归经">甘、平。归脾、肺经。</td>
                    <td data-th="功效">健脾益肺、养血生津</td>
                    <td data-th="主治">用于脾肺气虚、食少倦怠、咳嗽虚喘、气血不足、面色萎黄、心悸气短、津伤口渴、内热消渴</td>
                    <td data-th="class">补虚药（补气/养血/助阳/滋阴/祛风湿）</td>
                    <td data-th="名医对于药物的用法">补益中气</td>
                    <td data-th="classExp">补脾益气类</td>
                </tr>
                <tr>
                    <td data-th="name">甘草</td>
                    <td data-th="性味归经">甘、平。归心、肺、脾、胃经。</td>
                    <td data-th="功效">补脾益气、清热解毒、祛痰止咳、缓急止痛、调和诸药</td>
                    <td data-th="主治">用于脾胃虚弱、倦怠乏力、心悸气短、咳嗽痰多、脘腹、四肢挛急疼痛、痈肿疮毒、缓解药物毒性、烈性</td>
                    <td data-th="class">补虚药（补气/养血/助阳/滋阴/祛风湿）</td>
                    <td data-th="名医对于药物的用法">调和诸药；生甘草：调和诸药为主；炙甘草和中为主</td>
                    <td data-th="classExp">补脾益气类</td>
                </tr>
                <tr>
                    <td data-th="name">黄芪</td>
                    <td data-th="性味归经">甘、微温。归肺、脾经。</td>
                    <td data-th="功效">补气升阳、固表止汗、利水消肿、生津养血、行滞通痹、托毒排脓、敛疮生肌</td>
                    <td data-th="主治">用于气虚乏力、食少便溏、中气下陷、久泻脱肛、便血崩漏、表虚自汗、气虚水肿、内热消渴、血虚萎黄、半身不遂、痹痛麻木、痈疽难溃、久溃不敛</td>
                    <td data-th="class">补虚药（补气/养血/助阳/滋阴/祛风湿）</td>
                    <td data-th="名医对于药物的用法">补中气、降蛋白尿、降肌酐、双向免疫调节（抑制非正常免疫、调高正常免疫力）</td>
                    <td data-th="classExp">补脾益气类</td>
                </tr>
                <tr>
                    <td data-th="name">太子参</td>
                    <td data-th="性味归经">甘、微苦、平。归脾、肺经。</td>
                    <td data-th="功效">益气健脾、生津润肺</td>
                    <td data-th="主治">用于脾虚体倦、食欲不振、病后虚弱、气阴不足、自汗口渴、肺燥干咳</td>
                    <td data-th="class">补虚药（补气/养血/助阳/滋阴/祛风湿）</td>
                    <td data-th="名医对于药物的用法">补气阴、药性平和</td>
                    <td data-th="classExp">补脾益气类</td>
                </tr>
                <tr>
                    <td data-th="name">五指毛桃</td>
                    <td data-th="性味归经">味甘、性平。入脾、肺、肝经。</td>
                    <td data-th="功效">健脾补肺、行气利湿、舒筋活络之功效</td>
                    <td data-th="主治">主治脾虚浮肿、食少无力、肺痨咳嗽、盗汗、带下、产后无乳、风湿痹痛、水肿、肝硬化腹水、肝炎、跌打损伤</td>
                    <td data-th="class">补虚药（补气/养血/助阳/滋阴/祛风湿）</td>
                    <td data-th="名医对于药物的用法">补气</td>
                    <td data-th="classExp">补脾益气类</td>
                </tr>
                <tr>
                    <td data-th="name">重楼(七叶一枝花）</td>
                    <td data-th="性味归经">苦、微寒；有小毒。归肝经。</td>
                    <td data-th="功效">清热解毒、消肿止痛、凉肝定惊</td>
                    <td data-th="主治">用于疔疮痈肿、咽喉肿痛、蛇虫咬伤、跌扑伤痛、惊风抽搐</td>
                    <td data-th="class">清热类（清热解毒/清热利湿/清热凉血/清热通淋/清热燥湿/清热泻火）</td>
                    <td data-th="名医对于药物的用法">消蛋白尿</td>
                    <td data-th="classExp">降蛋白尿</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<style>
.table-container {
  position: relative !important;
  right: 0;
  margin-left: auto;
}

.table-responsive {
  max-height: 100vh;
  overflow: scroll;
}
</style>
