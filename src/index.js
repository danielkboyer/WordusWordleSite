import { isLabelWithInternallyDisabledControl } from '@testing-library/user-event/dist/utils';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import words from "../src/assets/words.txt";
class Square extends React.Component{
  
      
      render() {
          return (
          <input
              className={"square "+this.props.squareClass}
              onChange={this.props.onChange}
              value={this.props.value}
              placeholder={this.props.number}>
              
          </input>
          
        );
      }
    
  }
  
  class BoxList extends React.Component {

 
   
    renderSquare(i) {
      return (<Square
       value={this.props.squares[i]}
       onChange={(event) => this.props.onChange(i,event)}
       squareClass = {this.props.squareClass}
       number = {i+1}
       />
      );
    }
  
    render() {
     
  
      return (
        <div>
          
          <label className='title'>
            {this.props.title}
          </label>
          <div>

            {this.renderSquare(0)}
            {this.renderSquare(1)}
            {this.renderSquare(2)}
            {this.renderSquare(3)}
            {this.renderSquare(4)}
          </div>
        </div>
      );
    }
  }

  class HintList extends React.Component{

    render(){

      const words = this.props.hints.map((step,index) => {
        return (
          <li className='list-item' key={step.value}>
            <label>{step.value}</label>
          </li>
        )
      });
      return (
        <div>
        <div>
          <label className='title'>
            Hints (
              <input className='hint-box'
               value={this.props.hintCount}
               onChange={this.props.onChange}>
              </input>
              
              )
          </label>
        </div>
        <div className='hint'>
          <ul>
            {words}
          </ul>
        </div>
        </div>
      )
    }
  }

  class DisplayList extends React.Component{

    render(){

      
      const letters = this.props.letters.map((step,letter) => {
        const key = this.props.showIndex ? step.index + step.letter: step;
        const display = this.props.showIndex ? step.index+1 +":"+step.letter: step;

        return (
          <li className='list-item' key={key}>
            <button className={'remove-button '+this.props.className} onClick={() => this.props.onChange(step)}>{display}</button>
          </li>
        )
      })
      return (
        
        
        <ul>
          {letters}
        </ul>
       );
    }
  }
  
  class Game extends React.Component {
    
    constructor(props){
        super(props);
        this.state = {
            
            yellowSquares: Array(5).fill(""),
            yellowLetters: Array(0).fill({index:0,letter:""}),
            greenSquares: Array(5).fill(""),
            greenLetters: Array(0),
            invalidSquare: "",
            invalidLetters: Array(0),
            wordList: Array(0),
            hintCount: 300,
            
        }
        this.loadWords();
        

    }

    async loadWords(){
      return await fetch(words)
      .then(r => r.text())
      .then(text => {
        var wordList = Array(0);
        const temp =  shuffle(text.split('\n'))
        temp.forEach(element => {
          wordList.push({included:true,value:element});
        });
        this.setState({
          wordList: wordList
        })
      })
    }
    handleTypeInvalid(event) {
        const invalidLetters = this.state.invalidLetters.slice();

        const newLetter = event.target.value.toLowerCase();
        if(invalidLetters.find((t) => t === newLetter)){
          console.log("Letter has already been added");
          return;
        }

        if(this.state.yellowLetters.find((t) => t.letter === newLetter) || this.state.greenLetters.find((t) => t.letter === newLetter)){
          console.log("Cannot add a letter into invalid letters if letter is in word");
          return;
        }
        invalidLetters.push(newLetter);
        this.setState({
          invalidLetters: invalidLetters,
        },
        () => this.calculateHints());
        //Here we need to filter any words that are included to remove this letter

        //if greenletters OR yellow letters contains the invalid word then we do nothing
        //if(this.state.greenLetters.find((t) => t.letter === event.target.value) || this.state.yellowLetters.find((t) => t.letter === event.target.value)){
        //  return;
        //}
        
    }
    handleInvalidLetterRemove(letter){
        console.log(letter);
        const invalidLetters = this.state.invalidLetters.slice();
        const index = invalidLetters.indexOf(letter);
        invalidLetters.splice(index,1);

        this.setState({
          invalidLetters: invalidLetters,
        },
        () => this.calculateHints());
    }

    handleTypeGreen(i,event) {
        const greenLetters = this.state.greenLetters.slice();
        //If they hit backspace
        console.log(event.target.value);
        if(event.target.value == ""){
          const index = greenLetters.findIndex((t) => t.index === i);
          console.log(index)
          if(index == -1)
            return;
          const greenSquares = this.state.greenSquares.slice();
          greenSquares[i] = "";
          greenLetters.splice(index,1);

          this.setState({
            greenLetters: greenLetters,
            greenSquares: greenSquares

          },
          () => this.calculateHints());
          return;
        }

        //if they added a letter
        if(greenLetters.find((t) => t.index === i)){
          console.log("Letter has already been added to this index");
          return;
        }
        const greenSquares = this.state.greenSquares.slice();
        greenSquares[i] = event.target.value.toLowerCase();
        greenLetters.push({index:i,letter:event.target.value.toLowerCase()});
        this.setState({
          greenLetters: greenLetters,
          greenSquares: greenSquares
        },
        () => this.calculateHints());
    }
  
  handleTypeYellow(i,event) {
        const yellowLetters = this.state.yellowLetters.slice();
        console.log(i);
        const letter = event.target.value.toLowerCase();
        if(yellowLetters.find((t) => t.index === i && t.letter === letter )){
          console.log("Letter has already been added");
          return;
        }
        yellowLetters.push({index:i,letter:letter});
        this.setState({
          yellowLetters: yellowLetters,
        },
        () => this.calculateHints());
    }

    handleYellowLetterRemove(letter){
        console.log(letter);
        const yellowLetters = this.state.yellowLetters.slice();
        const index = yellowLetters.indexOf(letter);
        yellowLetters.splice(index,1);

        this.setState({
          yellowLetters: yellowLetters,
        },
        () => this.calculateHints())
    }

    hintCountChanged(event){
      var num = parseInt(event.target.value);
      if(num === NaN){
        num = 20;
      }

      this.setState({
        hintCount: num
      });

    }
    calculateHints(){

      console.log(this.state.greenLetters.length);
      const wordList = this.state.wordList.slice();
      for(var y = 0;y<wordList.length;y++){

        var passed = true;
        //checking if the word contains all of the green letters
        for(var p = 0;p< this.state.greenLetters.length;p++){
          if(wordList[y].value[this.state.greenLetters[p].index].toLowerCase() !== this.state.greenLetters[p].letter){
            wordList[y].included = false;
            passed = false;
            break;
          }
        }
        

        //make sure the word atleast contains one yellow letter
        for(var p = 0;p<this.state.yellowLetters.length;p++){
          if(!wordList[y].value.toLowerCase().includes(this.state.yellowLetters[p].letter)){
            wordList[y].included = false;
            passed = false;
            break;
          }
        }


        if(!passed)
          continue;
        for(var x = 0;x<wordList[y].value.length;x++){
          
          if(this.state.invalidLetters.find((t) => t == wordList[y].value[x].toLowerCase())){
            //console.log("Happened");
            wordList[y].included = false;
            passed = false;
            break;
          }

          if(this.state.yellowLetters.find((t)=> t.index === x && t.letter === wordList[y].value[x].toLowerCase())){
            wordList[y].included = false;
            passed = false;
            break;
          }

          
        


        };

        if(passed)
          wordList[y].included = true;

      };

      this.setState({
        wordList: wordList
      })
      console.log("Done Filtering");
    }

    render() {

      const loadLabel = this.state.wordList.length == 0 ? "Loading Words" : "Total Words: " + this.state.wordList.filter((t) => t.included === true).length+"/"+this.state.wordList.length;
     return (

        //
        <div className="main">
          <div className='main-title'>
          <h1>
          Wordle and Wordus Hint Machine
          </h1>
          </div>

          <div >
            <h2 className='title'>
              {loadLabel}
            </h2>
          </div>


          <div className="letter-input">
            <BoxList 
                squares = {this.state.greenSquares}
                squareClass = "green-square"
                onChange={(i,event) => this.handleTypeGreen(i,event)}
                title="Green Letters"
            />
          </div>
          <div></div>
          <div className="letter-input">
            <BoxList 
                squares = {this.state.yellowSquares}
                onChange={(i,event) => this.handleTypeYellow(i,event)}
                title="Yellow Letters"
                squareClass = "yellow-square"
            />
          </div>
          
         <div >
          <DisplayList
              showIndex = {true}
              letters = {this.state.yellowLetters}
              onChange={(letter) => this.handleYellowLetterRemove(letter)}
              className="yellow-button"
            />
          </div>

          <div>
            <div>
            <label className='title'>
              Invalid Letters
            </label>
            </div>
            <div className='letter-input'>
            <Square
              value={this.state.invalidSquare}
              onChange={(event) => this.handleTypeInvalid(event)}
              squareClass = "black-square"
            />

            
            </div>

            <div>
            <DisplayList
              showIndex = {false}
              letters = {this.state.invalidLetters}
              onChange={(letter) => this.handleInvalidLetterRemove(letter)}
              className="black-button"
            />
            </div>
          </div>
          <div>
            <HintList
            hints = {this.state.wordList.filter((t) => t.included).splice(0,this.state.hintCount)}
            hintCount = {this.state.hintCount}
            onChange={(event) => this.hintCountChanged(event)}
            ></HintList>
          </div>
         
          
        </div>
      );
    }
  }
  
  // ========================================
  
  ReactDOM.render(
    <Game />,
    document.getElementById('root')
  );
  
  function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }