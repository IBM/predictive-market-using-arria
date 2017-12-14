class Narrative {
    constructor() {
      this.root = document.getElementById('narrative');
      
    }

    clear() {
        this.root.innerHTML = "";
    }

    set content(arriaNarrative){

        this.clear();
        if (['overview', 'detailedAnalysis', 'marketChanges', 'modelDetails' ].some(function(element) {return (element in arriaNarrative);})){
            if ('overview' in arriaNarrative) {
                var header = document.createElement('h1')
                header.innerHTML= 'Overview';
                var text = document.createElement('div')
                text.innerHTML=arriaNarrative.overview;
                this.root.appendChild(header);
                this.root.appendChild(text.firstChild);
            }
            if ('detailedAnalysis' in arriaNarrative){
                var header = document.createElement('h1')
                header.innerHTML='Detailed Analysis';
                var text = document.createElement('div')
                text.innerHTML=arriaNarrative.detailedAnalysis;
                this.root.appendChild(header);
                this.root.appendChild(text.firstChild);
            }
            if ('marketChanges' in arriaNarrative){
                var header = document.createElement('h1')
                header.innerHTML='Market Changes';
                var text = document.createElement('div')
                text.innerHTML=arriaNarrative.marketChanges;
                this.root.appendChild(header);
                this.root.appendChild(text.firstChild);
            }
            if ('modelDetails' in arriaNarrative){
                var header = document.createElement('h1')
                header.innerHTML='Model Details';
                var text = document.createElement('div')
                text.innerHTML=arriaNarrative.modelDetails;
                this.root.appendChild(header); 
                this.root.appendChild(text.firstChild);
            }
      
        } else {
          this.root.html(JSON.stringify(arriaNarrative  ));
        }
    }

}
