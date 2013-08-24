using School.Model;
using School.Data;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using School.Servieces.Models;

namespace School.Servieces.Controllers
{
    public class StudentsController : ApiController
    {
        // GET api/values
        public IEnumerable<StudentModel> GetAll()
        {
            AddStudentsToDB();
            var context = new  SchoolContext();
            IEnumerable<StudentModel> students = context.Set<Student>().ToList()
                .Select(x => new StudentModel()
                {
                    Id = x.Id,
                    Fname = x.Fname,
                    Lname = x.Lname,
                    Grade = x.Grade,
                    Age = x.Age,
                    Marks = x.Marks.Select(m => new MarkModel
                    {
                        Id = m.Id,
                        Subject = m.Subject,
                        Score = m.Score
                    }).ToList()
                }).ToList(); ;
            return students;
        }

        private void AddStudentsToDB()
        {
            var context = new  SchoolContext();
            if (context.Set<Student>().ToList().Count == 0)
            {
                context.Students.Add(
                new Student
                {
                    Fname = "Doncho",
                    Lname = "Minkov",
                    Grade = 3,
                    Age = 25,
                    Marks = new List<Mark>() 
                    { 
                        new Mark { Subject = "Math", Score = 4 },
                        new Mark { Subject = "JavaScript", Score = 6 }
                    }
                });

                context.Students.Add(
                new Student
                {
                    Fname = "Nikolay",
                    Lname = "Kostov",
                    Grade = 2,
                    Age = 222,
                    Marks = new List<Mark>()
                    { 
                        new Mark { Subject = "MVC", Score = 6}, 
                        new Mark { Subject = "JavaScript", Score = 5}
                    }
                });

                context.Students.Add(
                new Student
                {
                    Fname = "Ivaylo",
                    Lname = "Kendov",
                    Grade = 1,
                    Age = 225,
                    Marks = new List<Mark>() 
                    { 
                        new Mark { Subject = "OOP", Score = 4 }, 
                        new Mark { Subject = "C#", Score = 6 } 
                    }
                });
                context.Students.Add(
                new Student
                {
                    Fname = "Georgi",
                    Lname = "Georgiev",
                    Grade = 1,
                    Age = 219
                });

                context.Students.Add(
                new Student
                {
                    Fname = "Asya",
                    Lname = "Georgieva",
                    Grade = 2,
                    Age = 228,
                    Marks = new List<Mark>() 
                    { 
                        new Mark { Subject = "Automation Testing", Score = 6 }, 
                        new Mark { Subject = "Manual Testing", Score = 4 } 
                    }
                });

                context.SaveChanges();
            }
        }

        // GET api/values/5
        public Student Get(int id)
        {
            throw new NotImplementedException();
        }

        // POST api/values
        public void Post([FromBody]string value)
        {
            throw new NotImplementedException();
        }

    }
}