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
                this.appendAll(this.root, text.children);
            }
            if ('detailedAnalysis' in arriaNarrative){
                var header = document.createElement('h1')
                header.innerHTML='Detailed Analysis';
                var text = document.createElement('div')
                text.innerHTML=arriaNarrative.detailedAnalysis;
                this.root.appendChild(header);
                this.appendAll(this.root, text.children);
            }
            if ('marketChanges' in arriaNarrative){
                var header = document.createElement('h1')
                header.innerHTML='Market Changes';
                var text = document.createElement('div')
                text.innerHTML=arriaNarrative.marketChanges;
                this.root.appendChild(header);
                this.appendAll(this.root, text.children);
                //this.root.appendChild(text.firstChild);
            }
            if ('modelDetails' in arriaNarrative){
                var header = document.createElement('h1')
                header.innerHTML='Model Details';
                var text = document.createElement('div')
                text.innerHTML=arriaNarrative.modelDetails;
                this.root.appendChild(header);
                this.appendAll(this.root, text.children);
            }
        } else {
          this.root.html(JSON.stringify(arriaNarrative  ));
        }
    }

    // append supported in js but not IE
    appendAll(parent, children){
        while (children.length > 0){
            parent.appendChild(children[0]);
        }
    }

}
