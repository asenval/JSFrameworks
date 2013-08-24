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
        [HttpGet]
        public IQueryable<StudentModel> GetAll()
        {
            AddStudentsToDB();
            var context = new  SchoolContext();
            IQueryable<StudentModel> students = context.Set<Student>()
                .Select(x => new StudentModel()
                {
                    Id = x.Id,
                    Fname = x.Fname,
                    Lname = x.Lname,
                    Grade = x.Grade,
                    Age = x.Age
                }); ;
            return students;
        }

        //api/students/{studentId}/marks
        [HttpGet]
        [ActionName("marks")]
        public IEnumerable<MarkModel> GetStudentMarks(int studentId)
        {
            var context = new SchoolContext();
            var student = context.Set<Student>().Where(st => st.Id == studentId).FirstOrDefault();

            
            IEnumerable<MarkModel> marks = student.Marks
                .Select(m => new MarkModel()
                {
                        Id = m.Id,
                        Subject = m.Subject,
                        Score = m.Score
                }).ToList(); ;
            return marks;
        }

        private void AddStudentsToDB()// execute only if database is empty
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

        // POST api/values
        public void Post([FromBody]string value)
        {
            throw new NotImplementedException();
        }

    }
}