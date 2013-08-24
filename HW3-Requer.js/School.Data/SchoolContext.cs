using School.Model;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;

namespace School.Data
{
    public class SchoolContext: DbContext
    {
        public SchoolContext()
            : base("SchoolDB")
        {
        }

        public DbSet<Mark> Marks { get; set; }
        public DbSet<Student> Students { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Student>().Property(x => x.Fname).HasMaxLength(50);
            modelBuilder.Entity<Student>().Property(x => x.Lname).HasMaxLength(50);
            modelBuilder.Entity<Student>().Property(x => x.Grade).IsOptional();
            modelBuilder.Entity<Student>().Property(x => x.Age).IsOptional();
            modelBuilder.Entity<Mark>().Property(x => x.Subject).HasMaxLength(50);
            
            base.OnModelCreating(modelBuilder);
        }
    }
}
