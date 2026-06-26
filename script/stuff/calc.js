class token {
  constructor(type, val) {
    this.type = type;
    this.val = val;
  }
}

class token_stream {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }

  // todo: bounds checking

  peek(n) {
    return this.tokens[this.pos + n];
  }

  eat() {
    let r = this.tokens[this.pos];
    this.pos++;
    return r;
  }

  uneat() {
    this.pos--;
  }
}

class ast_node {
  toString() {
    throw new Error("no child implementation of toString");
  }

  eval() {
    throw new Error("no child implementation of eval");
  }
}

class ast_sym_node extends ast_node {
  constructor(name) {
    super();
    this.name = name;
  }

  toString() {
    return this.name;
  }

  eval() {
    throw new Error("symbol table not used yet");
  }
}

class ast_num_node extends ast_node {
  constructor(val) {
    super();
    this.val = val;
  }

  toString() {
    return this.val.toString();
  }

  eval() {
    return this.val;
  }
}

class ast_binop_node extends ast_node {
  constructor(l, r) {
    super();
    this.l = l;
    this.r = r;
  }
}

class binop_add_node extends ast_binop_node {
  toString() {
    return `(${this.l.toString()} + ${this.r.toString()})`;
  }

  eval() {
    return this.l.eval() + this.r.eval();
  }
}

class binop_mul_node extends ast_binop_node {
  toString() {
    return `(${this.l.toString()} * ${this.r.toString()})`;
  }

  eval() {
    return this.l.eval() * this.r.eval();
  }
}

class binop_pow_node extends ast_binop_node {
  toString() {
    return `(${this.l.toString()} ^ ${this.r.toString()})`;
  }

  eval() {
    return this.l.eval() ^ this.r.eval();
  }
}

class ast_fun_node extends ast_node {
  constructor(name, args = []) {
    super();
    this.name = name;
    this.args = args;
  }

  toString() {
    return `${this.name}(${this.args.map(a => a.toString()).join(', ')})`;
  }

  eval() {
    throw new Error("functions not implemented yet");
  }
}

// todo: fix ts

class parser {
  constructor(stream) {
    this.stream = stream;
  }

  parse_exp() {
    let node = this.parse_trm();
    if(node === null) return null;

    let tok = this.stream.peek(0);
    while(tok.type == token_type.opr)  {
      if(tok.val == '+') {
        this.stream.eat();
        let r = this.parse_trm();
        node = new binop_add_node(node, r);
      } else {
        throw new Error("unknown operator for exp");
      }
      tok = this.stream.peek(0);
    }

    return node;
  }

  parse_trm() {
    let node = this.parse_fct();
    

    if(node === null) return null;

    /*
    switch(tok.type) {
      case token_type.opr:
        switch(tok.val) {
          case '*':
            var node2 = this.parse_fct();
            if(node2 === null) {
              throw new Error("unexpected eof");
            }
            return new binop_mul_node(node, node2);
          case '^':
            var node2 = this.parse_fct();
            if(node2 === null) {
              throw new Error("unexpected eof");
            }
            return new binop_pow_node(node, node2);
          case '+':
            this.stream.uneat();
            return node;
          default:
            throw new Error(`unknown operator for term ${tok.val}`);
        }
      case token_type.eof:
        return node;
      default:
        throw new Error(`unknown token for term ${tok.type}`);
    }
    */
   
    let tok = this.stream.eat();
    let esc = 0;
    while(tok.type == token_type.opr) {
      console.log("ss");
      switch(tok.val) {
        case '*':
          var node2 = this.parse_fct();
          if(!node2) throw new Error("unexpected eof");
          node = new binop_mul_node(node, node2);
          break;
        case '^':
          var node2 = this.parse_fct();
          if(!node2) throw new Error("unexpected eof");
          node = new binop_pow_node(node, node2);
          break;
        case '+':
          this.stream.uneat();
          esc = 1;
          break;
        default:

          throw new Error("unknown operator");
      }
      tok = this.stream.eat();
      
    }


    return node;
  }

  parse_fct() {
    let tok = this.stream.eat();
    switch(tok.type) {
      case token_type.num:
        return new ast_num_node(tok.val);
      case token_type.lpr:
        let t = this.parse_exp();
        this.stream.eat();
        return t;
      case token_type.eof:
        return null;
      default:
        throw new Error(`unknown token for factor ${tok.type}`);
    }
  }
}

const token_type = Object.freeze({
  eof: 'eof',
  sym: 'sym',
  num: 'num',
  opr: 'opr',
  lpr: 'lpr',
  rpr: 'rpr'
});

const test = new token_stream([
  new token(token_type.num, 5), new token(token_type.opr, '+'), new token(token_type.num, 6), 
  new token(token_type.opr, '+'), new token(token_type.num, 67), new token(token_type.opr, '*'),
  new token(token_type.num, -1), 
  new token(token_type.eof)
]);
const ptest = new parser(test);

let o = ptest.parse_exp();
