// マップの設定
const width = 650;
const height = 650;
const svg = d3.select("#mapContainer").append("svg")
    .attr("width", width)
    .attr("height", height);

// 地理的射影の設定
const projection = d3.geoMercator().scale(1200).center([145, 38]);
const path = d3.geoPath().projection(projection);

// GeoJSONデータを読み込む
d3.json("assets/prefectures.geojson").then(data => {
    // SVG上に都道府県を描画
    svg.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("stroke", "black")
        .attr("fill", "lightgray")
        .attr("id", d => `path-${d.properties.pref}`)  // GeoJSONデータのprefを使用して番号付け
        .on("mouseover", function(event, d) {
            const inputElem = document.querySelector(`#input-${d.properties.pref}`);
                d3.select(this).attr("fill", "orange");
        })
        .on("mouseout", function(event, d) {
            const inputElem = document.querySelector(`#input-${d.properties.pref}`);
            if (inputElem.value) {
                d3.select(this).attr("fill", "green");
            } else {
                d3.select(this).attr("fill", "lightgray");
            }
        })
        .on("click", function(event, d) {
            const inputElem = document.querySelector(`#input-${d.properties.pref}`);
            if (inputElem) {
                inputElem.focus();
            }
        });

    // 地図上にラベルを描画
    svg.selectAll("text")
    .data(data.features)
    .enter().append("text")
    .attr("id", d => `text${d.properties.pref}`)
    .attr("x", d => path.centroid(d)[0])  // 中心点のX座標
    .attr("y", d => path.centroid(d)[1])  // 中心点のY座標
    .attr("text-anchor", "middle")  // テキストを中心に配置
    .attr("font-size", "10px")  // フォントサイズを指定
    .attr("fill", "red") // 色を指定
    .style("font-weight", "bold") // 太く
    .style("pointer-events", "none")  // テキストに対するマウスイベントを無効化
    .text(d => d.properties.pref);  // ラベル名（ここでは都道府県名を想定）

    //表示がズレるので無理やり調整
    svg.select("#text13").attr("y", d => path.centroid(d)[1]-10);
    svg.select("#text14").attr("y", d => path.centroid(d)[1]+10);


    // 入力欄を動的に生成
    const inputArea = d3.select("#inputFields");
    data.features.forEach(feature => {
        const inputDiv = inputArea.append("div");
        
        inputDiv.append("label")
            .attr("for", `input-${feature.properties.pref}`)
            .text(`${feature.properties.pref}:`);

        inputDiv.append("input")
            .attr("type", "text")
            .attr("id", `input-${feature.properties.pref}`)
            .on("focus", function() {  
                const pathElement = d3.select(`#path-${feature.properties.pref}`);
                if (this.value) {
                    pathElement.attr("fill", "green");
                } else {
                    pathElement.attr("fill", "orange");
                }
            })
            .on("blur", function() {  
                const pathElement = d3.select(`#path-${feature.properties.pref}`);
                if (this.value) {
                    pathElement.attr("fill", "green");
                } else {
                    pathElement.attr("fill", "lightgray");
                }
            });
    });

    // 答え合わせ機能
    d3.select("#checkAnswers").on("click", function() {
        let correctCount = 0;
        
        data.features.forEach(feature => {
            const inputElem = document.querySelector(`#input-${feature.properties.pref}`);
            if (inputElem) {
                if (inputElem.value === feature.properties.name) {
                    correctCount++;
                    inputElem.style.backgroundColor = "green";
                } else {
                    inputElem.style.backgroundColor = "red";
                }
                
                // これ以上の入力を禁止
                inputElem.readOnly = true;
            }
        });
        
        // 結果を表示
        d3.select("#results").text(`正解数: ${correctCount} / ${data.features.length}`);
        if (correctCount == 47){
            //d3.select("#message").text("君は知力11だ！おめでとう！");
            msg = document.getElementById("message");
            msg.textContent = "君は知力11だ！おめでとう！";
        } else {
            msg = document.getElementById("message");
            msg.textContent = "動画を見て復習しよう！";
            ytlink = document.createElement("a");
            ytlink.href = "https://www.youtube.com/live/Sqf8dAJkAhE?si=IABHfylzdVJbof3p";
            ytlink.innerText = "【日本地図】47都道府県名を答える都道府県クイズ！バカかどうかハッキリさせます！";
            ytlink.target = "_blank";
            msg.appendChild(ytlink);
        }
    });
});
