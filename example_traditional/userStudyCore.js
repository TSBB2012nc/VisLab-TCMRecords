    //------------------------------------------------------------------
    // Global Vars
    // Scatterplot
    var g_scwidth = 200;
    var g_scheight = 200;
    
    var margin = {left: 10, right: 10, top: 10, bottom: 10};
    // record answers
    var dataRecord = {};
    dataRecord.answers = []; // user chosen angles
    dataRecord.gender = "x";
    dataRecord.age = "0";
    dataRecord.keys = []; // actual angles 
    dataRecord.rt = []; // response time
    dataRecord.corrCoef = [];
    dataRecord.dataSampleNum = [];
    dataRecord.tech = "";
    dataRecord.accuMean = 0;
    // input data
    var stimuli = { theta: 0, numSamples: 0, corrR: 0};
    var stimuliList = [];
    var numStimuli = 0;
    var stimuliOrderList = [];
    // output data
    var answerAngles = [];
    var goldAngles = []; 
    var rts = [];
    var corrCoef = [];
    var dataSampleNum = [];
    // ids
    var answers = [];
    var golds = [];
   
    var goldsTut = [];
    var answersTut = [];

    // factors
    var factorSampleSize = [40, 160]; // 10 samples are too small!
    var factorPearsonR = [1.0, 0.905];  // fully correlated and less, 0.964
    // The technique to use
    var PCTech = "traditional";
    // data related
    var numSamples = 40;//Use [40, 160]
    var numAngles = 16;//12;
    var pearsonR = 0.99;//0.905;
    var theta = 0.0;

    var minAngle = -Math.PI/2;
    var maxAngle = Math.PI/2;
    var angleInterval = 8.0 / 180.0 * Math.PI; //(maxAngle-minAngle) / numAngles;
    var pt0 = [0.5, 0.5];
    var s = 1.0 / numSamples;
    var a = 0,
        b = 0,
        x = 0,
        y = 0;
    // correlation metric
    var z = 2.5;
    var scSvgList = [];

    var iter = 0;
    var testData = [];
    var csvData = [];
    // If it's a tutorial
    var isTutorial = false;
    var globalCancel = false;
    var iterIntro = 0;

    // Response time
    var rt_t0;
    var rt_t1;
    
    
    function findRayBoxIntersect(box, r) {
        var hit = { t0: 0, t1: 0 };
        var t0 = r.mint, t1 = r.maxt;
        for (var i = 0; i < 2; ++i) {
          // Update interval for _i_th bounding box slab
          var invRayDir = 1.0 / r.d[i];
          var tNear = (box.pMin[i] - r.o[i]) * invRayDir;
          var tFar = (box.pMax[i] - r.o[i]) * invRayDir;
          // Update parametric interval from slab intersection $t$s
          if (tNear > tFar) {
            var temp = tNear;
            tNear = tFar;
            tFar = temp;
          }
          t0 = tNear > t0 ? tNear : t0;
          t1 = tFar < t1 ? tFar : t1;
          if (t0 > t1) {
            hit.t0 = null;
            hit.t1 = null;
            return hit;
          }
        }
        hit.t0 = t0;
        hit.t1 = t1;
        return hit;
      }

//------------------------------------------------------------------
    // var MultivariateNormal = require("multivariate-normal").default;
  function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }
    // load data func

    // Draw parallel coordinates
    function drawPC(data)
    {
        drawPConDiv(data, "#examplePC", 600, 400);
    }

    function drawPConDiv(data, divName, pcWidth, pcHeight)
    {

        var dimensions = {
            "V0": {
                type: "number",
                innerTickSize: 0,
                innerTickSize: 0,
                // yscale : "linear"
            },
            "V1": {
                type: "number",
                innerTickSize: 0,
                innerTickSize: 0,
                // yscale : "linear"
            }
        };

        if(PCTech == "angleUniform")
        {
            var parcoords = d3.parcoords()(divName)
            .data(data)
            .dimensions(dimensions)
            .width(pcWidth)
            .height(pcHeight)
            .margin({
                top: 0,
                left: 0,
                bottom: 24,
                right: 0
              })
            .color("black")
            // .render()
            .composite("darken")
            .alpha(0.25)
            .renderAU() 
            ;

            parcoords.createAxesNoTickLabels();

            var auXscale = [];
            for(var i = -0.5; i <= 1.5; i += 0.05)
              auXscale.push(i);
            console.log(auXscale);
            var x = d3.scale.linear()
                .domain(auXscale)
                .range([0, pcWidth]);


            var xAxis = d3.svg.axis()
                .orient("bottom")
                .tickSize(1)
                // .tickValues(auXscale)
                .ticks(5).scale(x);

                d3.select("body").select(divName)
                .select("svg").append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + (pcHeight - 3) + ")")
                .call(xAxis);

            // d3.select("body").select(divName)
            // .select("svg")
            // .append("line")
            // .attr("x1", 0)
            // .attr("y1", pcHeight - 1)
            // .attr("x2", pcWidth - 1)
            // .attr("y2", pcHeight - 1)
            // .style("stroke", "black");
        }
        else{
            var parcoords2 = d3.parcoords()(divName)
                .data(data)
                .dimensions(dimensions)
                .width(pcWidth)
                .height(pcHeight)
                .margin({
                    top: 0,
                    left: 0,
                    bottom: 24,
                    right: 0
                  })
                 .color("black")
                .composite("darken")
                 .alpha(0.25)
                .render()
                // .renderAU()
                ;
                // parcoords2.createAxes();
             parcoords2.createAxesNoTickLabels();

        }
    }

    // Functions for drawing scatterplots
    function drawSC(data)
    {
       return drawSConDiv(data, "#exampleSC", g_scwidth, g_scheight);
    }

    function drawRefSC(data)
    {
      return  drawSConDiv(data, "#referenceSC", 100, 100);
    }


    // Draw scatterplots
    function drawSConDiv(data, divName, scwidth, scheight) {

        var scSvg = d3.select(divName)
            .append("svg")
            .attr("width", scwidth + margin.left + margin.right)
            .attr("height", scheight + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var x = d3.scale.linear()
                .range([0, scwidth]);

            var y = d3.scale.linear()
                .range([scheight, 0]);
            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .tickSize(1)
                .ticks(0);

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .tickSize(1)
                .ticks(0);
                ;
            x.domain([0, 1]);
            y.domain([0, 1]);

            scSvg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + scheight + ")")
                .call(xAxis)
                // .append("text")
                // .attr("class", "label")
                // .attr("x", scwidth)
                // .attr("y", -6)
                // .style("text-anchor", "end")
                // .text("V0");
                ;

            scSvg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                // .append("text")
                // .attr("class", "label")
                // .attr("transform", "rotate(-90)")
                // .attr("y", 6)
                // .attr("dy", ".71em")
                // .style("text-anchor", "end")
                // .text("V1");
                ;
            scSvg.selectAll(".dot")
                .data(data)
                .enter().append("circle")
                .attr("class", "dot")
                .attr("r", 3.5)
                .attr("cx", function (d) { return x(d.V0); })
                .attr("cy", function (d) { return y(d.V1); })
                .style("fill", function (d) { return "gray"; })
                .style("opacity", 0.5);

            return scSvg;
        }

    // Save data to CSV
     function exportToCsv(filename, rows) {
        var processRow = function (row) {
            var finalVal = '';
            for (var j = 0; j < row.length; j++) {
                var innerValue = row[j] === null ? '' : row[j].toString();
                if (row[j] instanceof Date) {
                    innerValue = row[j].toLocaleString();
                };
                var result = innerValue.replace(/"/g, '""');
                if (result.search(/("|,|\n)/g) >= 0)
                    result = '"' + result + '"';
                if (j > 0)
                    finalVal += ',';
                finalVal += result;
            }
            return finalVal + '\n';
        };

        var csvFile = '';
        for (var i = 0; i < rows.length; i++) {
            csvFile += processRow(rows[i]);
        }

        var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, filename);
        } else {
            var link = document.createElement("a");
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                var url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }

    function rotMat(rotAngle)
    {
        return [
            [Math.cos(rotAngle), -Math.sin(rotAngle)],
            [Math.sin(rotAngle), Math.cos(rotAngle)]
        ];
    }

    function genDataMultivarGauss(theta, sampleNum, corrR){
    
        // First, rotate back to 0-deg
        var rotAngle = -Math.PI / 4; 
        // console.log("Ra", rotAngle / Math.PI * 180.0);
        var R = rotMat(rotAngle);
        //  console.log("R", R);
        var r = corrR;//(Math.exp(2.0 * z) - 1) / (Math.exp(2.0 * z) + 1);
        // var r = 0.99;
        console.log("r", r);
        var meanVector = [0, 0];
        var covMatrix = [[1.0, r], [r, 1.0]];

        var distr = window.MultivariateNormal.default(meanVector, covMatrix);

        var minVal = [Infinity, Infinity];
        var maxVal = [-Infinity, -Infinity];
        var data = [];
        var csvData = [];
        for (var j = 0; j < sampleNum; j++) {
            var p = distr.sample();
             x = R[0][0] * p[0] + R[0][1] * p[1];
             y = R[1][0] * p[0] + R[1][1] * p[1];
            // console.log("x", x, "y", y);

            minVal[0] = Math.min(x, minVal[0]);
            minVal[1] = Math.min(y, minVal[1]);

            maxVal[0] = Math.max(x, maxVal[0]);
            maxVal[1] = Math.max(y, maxVal[1]);
    
            var d = { V0: x, V1: y };
            data.push(d);
            var row = [];
            row.push(x); row.push(y);
            csvData.push(row);
        }
        // normalization
        var scale = 0.5 / Math.max(Math.abs(minVal[0]), Math.abs(maxVal[0]));
        // Rotate to theta
        R = rotMat(theta);
        for(var j = 0; j < sampleNum; j++){
            // scale
            var x = data[j].V0 * scale ;
            var y = data[j].V1 * scale ;
            // rotate
            var rx = R[0][0] * x + R[0][1] * y;
            var ry = R[1][0] * x + R[1][1] * y;
          
            // translate to center
            rx += 0.5;
            ry += 0.5;

            // console.log("rx", rx, "ry", ry)
            if(Math.abs(rx) < 1e-8)
              rx = 0.0;
            if(Math.abs(ry) < 1e-8)
             ry = 0.0;

            data[j].V0 = rx;
            data[j].V1 = ry;
            csvData[j] = data[j];
        }
      
        // console.log(data);
        var genData = {raw: data, csv: csvData};
        return genData;

    }

    // How should we response to the user click?
    function answerResponse(){
        var thisId = d3.select(this).attr("id");
        var thisAngle = d3.select(this).attr("angle");
      
        // Record time
        rt_t1 = performance.now();
        var rt = rt_t1 - rt_t0;
        console.log("rt" + (rt) + "ms");
        
        if(!isTutorial){
            rts.push(rt);
            answers.push(thisId);
            answerAngles.push(parseFloat(thisAngle));
        }
        else
        {
            answersTut.push(thisId);
        }

        if(isTutorial)
        {
            
            if(thisId == goldsTut[iter])
            {
                iter++;
                // Clear all scatterplots
                d3.select("#exampleSC").selectAll("svg").remove();
                showNextQuestion();
            }
            else
            {
                d3.select("body")
                .select("#infoTextTut")
                // .select("text")
                .text(function(d){
                    return "Sorry, your answer is incorrect! The correct answer is Option " + (goldsTut[iter] + 1); });
            }
        }
        else{
            // Clear all scatterplots
            d3.select("#exampleSC").selectAll("svg").remove();
            iter++;
            showNextQuestion();
        }
    
    }

    function showNextQuestion() {
          d3.select("#infoTextTut").text("");
          d3.select("#infoTextStu").text("");
            if (iter < numStimuli) {
                if(isTutorial)
                {
                    d3.select("body")
                    .select("#headTextTut")
                    .text(function(d){
                        return "Tutorial Progress " + (iter + 1) + "/" + (numStimuli); 
                    });
                }
                else{
                    d3.select("body")
                    .select("#headTextStu")
                    .text(function(d){
                        return "Study Progress " + (iter + 1) + "/" + (numStimuli); 
                    });
                }
                // Draw PC
                
                 if(isTutorial)
                 {
                    var angleRangeId = getRandomInt(numAngles);
                    theta =(Math.random() + angleRangeId) * angleInterval + minAngle;
                 }
                 else
                 {
                    var sid = stimuliOrderList[iter];
                     theta = stimuliList[sid].theta;
                     numSamples = stimuliList[sid].numSamples;
                     pearsonR = stimuliList[sid].corrR;

                     dataSampleNum.push(numSamples);
                     corrCoef.push(pearsonR);
                 }

                var keyData = genDataMultivarGauss(theta, numSamples, pearsonR);
                csvData = keyData.csv;
                drawPC(keyData.raw);
                // var fileName = "line_"+a.toPrecision(3)+"_"+b.toPrecision(3)+".csv";
                var htmlName = "line_" + a.toPrecision(3) + "_nS"+numSamples+"_auPC";
                document.title = htmlName;
                // console.log(testData);
                // Draw 4 scatterplots
                var thetaGold = theta; // record the actual angle
                var goldId = getRandomInt(4);
                var goldDeg = thetaGold * 180/Math.PI;
                console.log("thetaGold", goldDeg.toFixed(1), "goldId", goldId);
               
                if(!isTutorial)
                {
                    golds.push(goldId);                   
                    goldAngles.push(+goldDeg.toFixed(1));

                }
                else
                {
                    goldsTut.push(goldId);
                }

                scSvgList = [];
                var thetaDegList = [];
                var sc = null;
               var existLvls = [];
                for(var jj = 0; jj < 4; jj++)
                {
                    console.log(jj);
                    if( jj == goldId)
                    {
                        theta = thetaGold;

                        sc = drawSC(keyData.raw);
                    }
                    else
                    {
                        // False data for distruption
                        var perturbLevels = 9;
                        var minDegDif = 8.0; // min degree difference
                        var perturbInterval = Math.PI / 180 * minDegDif;
                        var lvl = 0;

                        for(;;)
                        {
                            var shownBefore = false;
                            lvl = getRandomInt(perturbLevels) + 1 - Math.ceil(perturbLevels/2);
                            if(lvl == 0)
                                continue; // Ensure that the level doesn't equal to 0!
                            for(var ii = 0; ii < existLvls.length; ii++)
                            {
                                if(existLvls[ii] == lvl){
                                    shownBefore = true;
                                    break;
                                }
                            }
                            if(shownBefore) // Ensure that the level is' not shown before!
                                continue;
                            else
                                break;
                        }
                        existLvls.push(lvl);
                        //  console.log("lvl", lvl);
                        theta = thetaGold + (lvl) * perturbInterval ;

                        var falseData = genDataMultivarGauss(theta, numSamples, pearsonR);
                        sc = drawSC(falseData.raw);
                    }
                    // Get angle in Deg
                    var degTheta = theta / Math.PI * 180.0;
                    thetaDegList.push(degTheta);
                    // console.log("Theta in Deg", degTheta);
                    sc.append("text")
                    .attr("id", jj)
                    .attr("x", 0)
                    .attr("y", g_scheight/2)
                    .style("fill", "black")
                    .style("font-size", "20px")
                    .attr("dy", ".35em")
                    .attr("text-anchor", "left")
                    .style("pointer-events", "none")
                    .text(function (d) {
                        var id = d3.select(this).attr("id");
                        var thetaInDeg = thetaDegList[id];
                        if(thetaInDeg <= -90)
                            thetaInDeg += 180.0;
                        else if(thetaInDeg > 90.0)
                            thetaInDeg -= 180.0;
                        return thetaInDeg.toFixed(1) + " Deg"; });

                    sc.append("svg:rect")
                        .attr("id", jj)
                        .attr("angle", function(d){ 
                            var id = d3.select(this).attr("id");
                            var thetaInDeg = thetaDegList[id];
                            if(thetaInDeg <= -90)
                                thetaInDeg += 180.0;
                            else if(thetaInDeg > 90.0)
                                thetaInDeg -= 180.0;
                            return thetaInDeg.toFixed(1) + " Deg"; })
                        .attr("x", -margin.left/2)
                          .attr("y", -margin.top/2)
                          .attr("width", g_scwidth + margin.left/2 + margin.right/2)
                          .attr("height", g_scheight + margin.top/2 + margin.bottom/2)
                          .style("fill", "blue")
                          .style("fill-opacity", 0)
                          .style("stroke", "gray")
                          .attr("rx", 10)
                          .attr("ry", 10)
                          .on("mouseover", function (d) {
                                 d3.select(this).style("cursor", "pointer")
                                 .style("stroke", "blue");
                             })
                            .on("mouseout", function (d) {
                                     d3.select(this).style("cursor", "default")
                                     .style("stroke", "gray");
                                 })
                             //.attr("xlink:href", function(d){return jj;})
                             .on("click", answerResponse);
                    scSvgList.push(sc);
                }

                // Record time
                rt_t0 = performance.now();
            }
            else
            {   
                if(isTutorial)
                    toNextStage("Well done! Let's start the actual study!",  1);
                else{
                    var accuracy = 0;
                    for(var i = 0; i < goldAngles.length; i++)
                    {
                        if(answers[i] == golds[i])
                            accuracy ++;
                    }
                    accuracy /= golds.length;
                    
                    // Clear all contents
                    d3.select("body").select("#topStu").remove();
                    d3.select("body").select("#introTextStu").remove();
                    d3.select("body").select("#introText").remove();
                    d3.select("body").select("#contentStu").remove();
                  
                    // Record useful output
                    dataRecord.answers = answerAngles;
                    dataRecord.keys = goldAngles;
                    dataRecord.rt = rts;
                    dataRecord.tech = PCTech;
                    dataRecord.corrCoef = corrCoef;
                    dataRecord.dataSampleNum = dataSampleNum;
                    dataRecord.accuMean = accuracy;
                    // Generate turkcode
                    // Submit to our google sheets
                    var turkcode = (Math.floor(Math.random() * 89999999) + 10000000).toString();
                    // Upload to server
                    submitJSONtoGoogleSheets(turkcode);

                    var txtsvg = d3.select("body")
                    .select("#infoTextStu")
                    .attr("x", 0)
                    .attr("y", g_scheight/2)
                    .style("fill", "black")
                    .style("font-size", "36px")
                    .attr("dy", ".35em")
                    .attr("text-anchor", "left")
                    .style("pointer-events", "none")
                    .text(function (d) { 
                            return "Well Done! Thanks for participating in our study! "+
                            "Your completion code is "+ turkcode +  
                            ". Your accuracy is " + 
                            (accuracy.toPrecision(2) * 100) + "%"; });

                }
                return;
            }
        }
    
    function drawPCautoSize(data, divName)
    {
        var dimensions = {
            "V0": {
                type: "number",
                innerTickSize: 0,
                innerTickSize: 0,
                // yscale : "linear"
            },
            "V1": {
                type: "number",
                innerTickSize: 0,
                innerTickSize: 0,
                // yscale : "linear"
            }
        };

        if(PCTech == "angleUniform")
        {
            var parcoords = d3.parcoords()(divName)
            .data(data)
            .dimensions(dimensions)
            .margin({
                top: 0,
                left: 0,
                bottom: 24,
                right: 0
              })
            .color("black")
            // .render()
            .composite("darken")
            .alpha(0.25)
            .renderAU() 
            ;

            parcoords.createAxes();
        }
        else{
            var parcoords2 = d3.parcoords()(divName)
                .data(data)
                .dimensions(dimensions)
                .margin({
                    top: 0,
                    left: 0,
                    bottom: 24,
                    right: 0
                  })
                .color("black")
                .composite("darken")
                .alpha(0.25)
                .render()
                // .renderAU()
                ;
                parcoords2.createAxes();

        }
    }
    
    function toNextStage(msg, state)
    {
         
        d3.select("#content").remove();   
        d3.select("#headText")
        .style("font-size", "20px")
        .text("");

        d3.select("body").select("#infoTextTut")
        .style("font-size", "20px")
        .text(msg);
        d3.select("body").select("#infoTextIntro")
        .style("font-size", "20px")
        .text(msg);
        switch(state)
        {
            case 0:
            d3.select("#NextIntro")
            .on("click", welcome.click.introNext());
            break;
            case 1:
            d3.select("#NextTut")
            .on("click", welcome.click.tutorialNext());
            break;
        }
    }

    // Draw the reference page
    function drawRefPage()
    {
        var refAnglesDeg = [0, 22.5, 45, 67.5, 90, -67.5, -45, -22.5];
        var dataList = [];
        d3.selectAll(".refPC")
        .each(function(d, i){
            var angleRad = refAnglesDeg[i] / 180 * Math.PI;
            var keyData = genDataMultivarGauss(angleRad, numSamples, pearsonR);
            var pc = drawPConDiv(keyData.raw, this, 180, 180);
        });

    }



    // The introduction
    function showMarkedIntroData(anglesDeg)
    {
        if(iterIntro < anglesDeg.length)
        {
             d3.select("#examplePC").selectAll("img").remove();
             d3.select("#exampleSC").selectAll("img").remove();
            var angle = anglesDeg[iterIntro];
            var angleInName = (Math.floor(angle) == angle )? angle : angle * 10;
            if(angleInName < 0)
                angleInName = "_" + Math.abs(angleInName);
            angleInName = angleInName + "Deg";
            console.log(angleInName);
            // Use png images
            d3.select("#examplePC")
            .append("img")
            .attr("width", function(d){ 
                if(PCTech == "angleUniform")
                return 600;
                else
                    return 400;})
            .attr("heigth", function(d){ 
                if(PCTech == "angleUniform")
                return 400;
                else
                    return 300;})
            .attr("align","middle")
            .attr("src", function(d){
                if(PCTech == "angleUniform")
                    return "auIntro"+angleInName+"PC.png";
                else
                    return "tradIntro"+angleInName+"PC.png";
            });

            d3.select("#exampleSC")
            .append("img")
            .attr("width", 200)
            .attr("heigth", 200)
            .attr("src", function(d){
                if(PCTech == "angleUniform")
                    return "auIntro"+angleInName+"SC.png";
                else
                    return "tradIntro"+angleInName+"SC.png";
            })


                    // More to show
        d3.select("body").select("#NextIntro").on("click", function () {
            // Clear all scatterplots
            d3.select("#exampleSC").selectAll("svg").remove();
            iterIntro++;
            showMarkedIntroData(anglesDeg);
        });
        }
        else
        {
            toNextStage("", 0);
            return true; // the intro is finished
        }
    }

    function showIntroData(anglesDeg)
    {
        if(iterIntro < anglesDeg.length)
        {
            // Use perfectly correlated 
            var pearsonR = 1.0;
            var angleRad = anglesDeg[iterIntro] / 180 * Math.PI;
            var keyData = genDataMultivarGauss(angleRad, numSamples, pearsonR);
            
            csvData = keyData.csv;
            drawPC(keyData.raw);
            var sc = drawSC(keyData.raw);

            // Draw Label
            sc.append("text")
            .attr("x", 0)
            .attr("y", g_scheight/3)
            .style("fill", "black")
            .style("font-size", "20px")
            .attr("dy", ".35em")
            .attr("text-anchor", "left")
            .style("pointer-events", "none")
            .text(function (d) {
                return anglesDeg[iterIntro].toFixed(1) + " Deg"; });

            // Get the trend line
            var dy = Math.sin(angleRad);
            var dx = Math.cos(angleRad);
            var ox = 0.5 * g_scwidth;
            var oy = 0.5 * g_scheight;

            rray = {};
            rray.d = [dx, dy];
            rray.o = [ox, oy];
            rray.mint = -Infinity;
            rray.maxt = Infinity;

            bbox = {};
            bbox.pMin = [0,0];
            bbox.pMax = [g_scwidth, g_scheight];
            // Get intersections with the plot bounding box
            var hit = findRayBoxIntersect(bbox, rray);
            var hitPt1 = {x: rray.o[0] + rray.d[0] * hit.t0, 
                y: rray.o[1] + rray.d[1] * hit.t0
            };
            var hitPt2 = {
                x: rray.o[0] + rray.d[0] * hit.t1,
                y: rray.o[1] + rray.d[1] * hit.t1
            };    

            sc.append("line")
                .attr("x1", hitPt1.x)
                .attr("y1", g_scheight - 1 - hitPt1.y)
                .attr("x2", hitPt2.x)
                .attr("y2", g_scheight - 1 - hitPt2.y)
                .style("stroke", "steelblue")
                .style("stroke-width", 3)
                .style("opacity", 0.5)
                ;

            var htmlName = "line_" + a.toPrecision(3) + "_nS"+numSamples;
            document.title = htmlName;

                    // More to show
        d3.select("body").select("#NextIntro").on("click", function () {
            // Clear all scatterplots
            d3.select("#exampleSC").selectAll("svg").remove();
            iterIntro++;
            showIntroData(anglesDeg);
        });
        }
        else
        {
            toNextStage("", 0);
            return true; // the intro is finished
        }
    }
 
    function introduction()
    {
        var exampleAnglesDeg = [0, 22.5, 45, 67.5, 90, -67.5, -45, -22.5];
        // Draw PC
        if( false == showMarkedIntroData(exampleAnglesDeg))
        // if( false == showIntroData(exampleAnglesDeg))
            return false;

        if(iterIntro >= exampleAnglesDeg.length){
            return true;
        }
    }

    function tutorial()
    {
        numStimuli = 5;// we have 5 test cases
        // drawRefPage();
        d3.select("#refImg")
        .attr("src", function(d){
            if(PCTech == 'traditional')
                return "refTradPC.png";
            else
                return "refAUPC.png";
        });
        d3.select("#infoText").append("text");
        numAngles = 16; 
        isTutorial = true;
        showNextQuestion();
    }

    // /**
    // * Shuffles array in place.
    // * @param {Array} a items An array containing the items.
    // */
    function shuffle(a) {
        var j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
        return a;
    }

    function actualStudy()
    {
         numAngles = 16;
        isTutorial = false;
        d3.select("#refImgStudy")
        .attr("src", function(d){
            if(PCTech == 'traditional')
                return "refTradPC.png";
            else
                return "refAUPC.png";
        });
        stimuliOrderList = [];
        d3.csv("./stimuli.csv", function(data){

            for(var i = 0; i < data.length; i++)
            {
                var datum = {}
                datum.theta = +data[i].theta;
                datum.numSamples = +data[i].numSamples;
                datum.corrR = +data[i].pearsonR;
                
                stimuliList.push(datum);
                stimuliOrderList.push(i);
            }
            // Shuffle the order but within conditions
            var condOrder = [];
            for(var i = 0; i < factorPearsonR.length * factorSampleSize.length; i++)
                condOrder.push(i);
            condOrder = shuffle(condOrder);
            console.log(condOrder);
            var angleList = [];
            for(var i = 0; i < numAngles; i++)
            {
                angleList.push(i);
            }

            for(var j = 0; j < condOrder.length; j++)
            {
                var k = condOrder[j];
                var startId = k * numAngles;
                angleList = shuffle(angleList);
                for(var i = 0; i < angleList.length; i++)
                    stimuliOrderList[startId + i] = startId + angleList[i];
            }
            console.log("orderList", stimuliOrderList);

            iter = 0;
            numStimuli = data.length;
            // go
            showNextQuestion();
        })
    }

    function generateStimuli()
    {

        var rows = [];
        var angleList = [];
        // for(var i = 0; i < numAngles; i++)
        // {
        //     var angleRangeId = getRandomInt(numAngles);
        //     var testTheta =(Math.random() + angleRangeId) * angleInterval + minAngle;
        //     angleList.push(testTheta);
        // }
        var row = [];
        row.push("theta", "numSamples", "pearsonR");
        rows.push(row);
        for(var rid = 0; rid < factorPearsonR.length; rid++)
        {
            for(var nid = 0; nid < factorSampleSize.length; nid ++)
            {
                for(var i = 0; i < numAngles; i++)
                {
                    row = [];
                    var angleRangeId = getRandomInt(numAngles);
                    var testTheta =(Math.random() + angleRangeId) * angleInterval + minAngle;
                    row.push(testTheta, factorSampleSize[nid], factorPearsonR[rid]);
                    // row.push(angleList[i], sampleSizeList[nid], pearsonRList[rid]);
                    rows.push(row);
                }
            }
        }
        
        exportToCsv("stimuli.csv", rows);
    }

// main();
