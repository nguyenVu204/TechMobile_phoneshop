namespace PhoneShop.API.Models
{
    public class News
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? Summary { get; set; } 
        public string Content { get; set; } = string.Empty; 
        public string? Thumbnail { get; set; }

        public string AuthorId { get; set; } = string.Empty; // FK -> AspNetUsers

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        public string Status { get; set; } = "Draft";
        public int ViewCount { get; set; } = 0;

        public int? RelatedProductId { get; set; }
        public Product? RelatedProduct { get; set; }

        public List<NewsCategoryMapping> CategoryMappings { get; set; } = new List<NewsCategoryMapping>();
        public List<NewsComment> Comments { get; set; } = new List<NewsComment>();
    }
}
