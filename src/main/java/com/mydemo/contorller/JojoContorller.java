package com.mydemo.contorller;

import com.mydemo.entity.Jojo;
import com.mydemo.mapper.JojoMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class JojoContorller {

    @Autowired
    JojoMapper jojoMapper;

    @RequestMapping("/insert")
    public String insert(String name, Integer age){
        return jojoMapper.insert(new Jojo(name,age))>0?"success!":"fail!";
    }
    @RequestMapping("/select1")
    public List<Jojo> select1(){
        return jojoMapper.selectList(null);
    }

    @RequestMapping("/select2")
    public Jojo findJojoByNameStartingWithY(){
        return jojoMapper.findJojoByNameStartingWithY();
    }
}
