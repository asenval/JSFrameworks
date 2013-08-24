namespace School.Data.Migrations
{
using School.Model;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Migrations;
using System.Linq;

    internal sealed class Configuration : DbMigrationsConfiguration<School.Data.SchoolContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = true;
        }

        protected override void Seed(School.Data.SchoolContext context)
        {
            //  This method will be called after migrating to the latest version.

            //  You can use the DbSet<T>.AddOrUpdate() helper extension method 
            //  to avoid creating duplicate seed data. E.g.
            //
                //context.Marks.AddOrUpdate(
                //    new Mark { Subject = "Math" },
                //    new Mark { Subject = "JavaScript" },
                //    new Mark { Subject = "MVC" },
                //    new Mark { Subject = "OOP" },
                //    new Mark { Subject = "Unit Testing" },
                //    new Mark { Subject = "WPF" },
                //    new Mark { Subject = "Automation Testing" },
                //    new Mark { Subject = "Manual Testing" }
                //    );
            context.Students.AddOrUpdate(
                new Student { Fname = "Doncho", Lname = "Minkov", Grade = 3, Age = 25, 
                    Marks = new List<Mark>() 
                    { 
                        new Mark { Subject = "Math", Score = 4 },
                        new Mark { Subject = "JavaScript", Score = 6 }
                    }
                });

            context.SaveChanges();
            /*new Student("Doncho", "Minkov", 3, 25, [new Mark("Math", 4), new Mark("JavaScript", 6)]),
			new Student("Nikolay", "Kostov", 2, 22, [new Mark("MVC", 6), new Mark("JavaScript", 5)]),
			new Student("Ivaylo", "Kendov", 1, 25, [new Mark("OOP", 4), new Mark("C#", 6)]),
			new Student("Svetlin", "Nakov", 3, 23, [new Mark("Unit Testing", 5), new Mark("WPF", 6)]),
            new Student("Georgi", "Georgiev", 1, 19),
			new Student("Asya", "Georgieva", 2, 28, [new Mark("Automation Testing", 6), new Mark("Manual Testing", 4)])*/
            
        }
    }
}
